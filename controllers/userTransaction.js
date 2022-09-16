import Joi from "joi";
import { Transaction, User } from "../models";
import Pagination from "../pagination/Pagination";
import CustomErrorHandler from "../service/CustomErrorHandler";
import moment from "moment";

const userTransactionController = {
  async transaction(req, res, next) {
    const { type, amount, category, mode, user_id } = req.body;

    const userTransactionSchema = Joi.object({
        type: Joi.string().valid('income', 'expense').required(),
        amount: Joi.number().required(),
        category: Joi.string().required(),
        mode: Joi.string().valid('cash', 'online').required()
    })

    const { error } = userTransactionSchema.validate({ type, amount, category, mode });

    if (error) {
      return next(error);
    }

    try {

      const transaction = new Transaction({
        type,
        amount,
        category,
        mode,
        user_id,
        notes: req.body.notes ? req.body.notes : null
      })

      await transaction.save();

      res.json({
        success: true,
        transaction
      });
    } catch (err) {
      return next(err);
    }
  },

  getDateType() {

  },

  async transactionByUser(req, res, next) {

    // console.log(req.query);
    const { dateType = '', startDate = '', endDate = '', transactionType = '', category = ''} = req.query;
    console.log(startDate);
    function getDateType(dateType) {
      switch (dateType)
      {
        case "today":
          return moment().format();
        case "yesterday":
          return moment().subtract(1, 'days').format();
        case "thisMonth": 
            return { $gte: moment().startOf('month').format(), $lte: moment().endOf('month').format() }
        case "thisMonth": 
            return { $gte: moment().subtract(1, 'months').startOf('month').format(), $lte: moment().subtract(1, 'months').startOf('month').format() }
        default: 
            return moment().format();
      }
    }

    function getStartAndEndDate(startDate, endDate) {
      if(!endDate) {
        return {
          $gte : moment(startDate).startOf('day').toDate(),
          $lte : moment(startDate).endOf('day').toDate(),
        }
      }

      return {
        $gte : moment(startDate).startOf('day').toDate(),
        $lte : moment(endDate).endOf('day').toDate(),
      }
    }
    console.log(getStartAndEndDate(startDate, endDate));

    let page = 1;
    let search = '';
    const getUser = await User.findOne({ _id: req.params.id });

    if(!getUser) {
        return next(CustomErrorHandler.notFound());
    }

    if(req.query.search) {
      search = req.query.search;
    }

    const resultPerPage = 1;
    const transactionCount = await Transaction.countDocuments({ 
      user_id: req.params.id,
      $or: [
        {
          createdAt: getDateType(dateType),
          createdAt: getStartAndEndDate(startDate, endDate),
          type: transactionType && transactionType,
          category: category && category
        }
      ]
    });

    const transactions = await Transaction.find({ 
      user_id: req.params.id,
      $or: [
        {
          createdAt: getDateType(dateType),
          createdAt: getStartAndEndDate(startDate, endDate),
          type: transactionType && transactionType,
          category: category && category
        }
      ]
    });

    res.json({transactionCount, transactions});

  },

  async getTransactionReport(req, res, next) {
    

    const report = await Transaction.aggregate([
      {
        $match: {
          type: 'expense'
        }
      },
      {
        $group: {
          _id: "$_id",
          total: {
            $sum: {
              $add: ["$amount"]
            }
          },
          createdAt: {
            $first: "$createdAt"
          }
        }
      }
    ]);

    const getReportByType = await Transaction.find({
      type: {
        $in: ['expense', 'income']
      }
    })

    const incomeTotal = getReportByType.filter(item => {
      if(item.type === 'income') {
        return item.amount
      }
    }).map((res) => {
      return res.amount
    }).reduce((prev, current) => prev + current, 0)
    // console.log(incomeTotal)
    const expenseTotal = getReportByType.filter(item => {
      if(item.type === 'expense') {
        return item.amount
      }
    }).map((res) => {
      return res.amount
    }).reduce((prev, current) => prev + current, 0)
    // console.log(expenseTotal);

    return res.json({ report, incomeTotal, expenseTotal })
  }
};

export { userTransactionController };
