import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponce.js";
import { Transaction } from "../models/transaction.model.js";
import Bank from "../models/bank.model.js";
import { ApiError } from "../utils/apiErrors.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";
import TransactionType from "../models/transactionType.model.js";
import { User_detail } from "../models/userDetail.model.js";
import PaymentType from "../models/paymentType.model.js";


const getTransaction = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.body;

  // Validate that dates are provided
  if (!fromDate || !toDate) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getTransaction Fail", [
        {  message: "fromDate and toDate are required" },
      ])
    );
  }

  // Find transactions between fromDate and toDate
  const transaction = await Transaction.find({
    date: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    },
    user_master: req.user._id
  })
    .populate([
      { path: "bank" },
      { path: "category" },
      { path: "transaction_type" },
      { path: "payment_type" },
    ])
    .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
    if(!transaction){
      return res
    .status(200)
    .json(
      new ApiError(400, "getTransaction Fail", [
        {  message: "Transaction List not found" },
      ])
    );
    }
  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transaction list retrieved"));
});

const getTransactionById = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  const transaction = await Transaction.findOne({ _id: reqBody._id,user_master: req.user._id }).populate([
    { path: "bank" },
    { path: "category" },
    { path: "transaction_type" },
    { path: "payment_type" },
  ]);
  // Transaction.findByIdAndDelete({ _id: reqBody._id });
  if (!transaction) {
    return res
    .status(200)
    .json(
      new ApiError(400, "getTransactionById Fail", [
        {  message: "Transaction Not Found" },
      ])
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "Transaction Found"));
});
const getRecentTransaction = asyncHandler(async (req, res) => {
  const { count } = await req.body;
  const transaction = await Transaction.find({user_master: req.user._id})
    .populate([
      { path: "bank" },
      { path: "category" },
      { path: "transaction_type" },
      { path: "payment_type" },
    ])
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order (newest first)
    .limit(count); // Limit to 10 results;
    if(!transaction){
      return res
    .status(200)
    .json(
      new ApiError(400, "getRecentTransaction Fail", [
        {  message: "Transaction Not Found" },
      ])
    );
    }
  return res
    .status(201)
    .json(new ApiResponse(200, transaction, "Transaction Found"));
});
const addEditTransaction = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const reqBody = await req.body;
  const {
    _id,
    amount,
    category,
    transaction_type,
    payment_type,
    bank,
    date,
    description,
  } = reqBody;

  const type = await TransactionType.findOne({ _id: transaction_type });
  const payment_method = await PaymentType.findOne({ _id: payment_type });
  const cashAccount = await User_detail.findOne({
    user_master: req.user._id,
  }).session(session);
  // Update existing transaction
  if (_id) {
    const transaction = await Transaction.findOne({ _id,user_master: req.user._id }).session(session);
    const oldAmount = transaction.amount;
    if (type.name.trim().toLowerCase() === "debit".toLowerCase()) {
      if (payment_method.name.trim().toLowerCase() === "cash".toLowerCase()) {
        if (!cashAccount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        if (parseFloat(cashAccount.cash_amount) < parseFloat(amount)) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account can not be negative" },
            ]));
        }
        cashAccount.cash_amount =
          parseFloat(cashAccount.cash_amount) +
          parseFloat(oldAmount) -
          parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (
        payment_method.name.trim().toLowerCase() === "bank".toLowerCase()
      ) {
        const bankAmount = await Bank.findOne({ _id: bank,user_master: req.user._id }).session(session);
        if (!bankAmount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        if (parseFloat(bankAmount.current_balance) < parseFloat(amount)) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Bank account can not be negative" },
            ]));
        }

        bankAmount.current_balance =
          parseFloat(bankAmount.current_balance) +
          parseFloat(oldAmount) -
          parseFloat(amount);
        await bankAmount.save({ session });
      }
    } else if (type.name.trim().toLowerCase() === "credit".toLowerCase()) {
      if (payment_method.name.trim().toLowerCase() === "cash".toLowerCase()) {
        //const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        // if (parseFloat(cashAccount.cash_amount) < parseFloat(amount)) {
        //   throw new ApiError(400, "Cash account can not be negative");
        // }

        cashAccount.cash_amount =
          parseFloat(cashAccount.cash_amount) -
          parseFloat(oldAmount) +
          parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (
        payment_method.name.trim().toLowerCase() === "bank".toLowerCase()
      ) {
        const bankAmount = await Bank.findOne({ _id: bank,user_master: req.user._id }).session(session);
        if (!bankAmount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Bank account not found" },
            ]));
        }
          // if (parseFloat(bankAmount.current_balance) < parseFloat(amount)) {
          //   throw new ApiError(400, "Bank account can not be negative");
          // }

        bankAmount.current_balance =
          parseFloat(bankAmount.current_balance) -
          parseFloat(oldAmount) +
          parseFloat(amount);
        await bankAmount.save({ session });
      }
    }
    await Transaction.findOneAndUpdate(
      { _id,user_master: req.user._id },
      {
        amount,
        category,
        transaction_type,
        payment_type,
        bank,
        date,
        description,
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    // return NextResponse.json({
    //   message: "Transaction Updated",
    //   success: true,
    // });
    return res
      .status(201)
      .json(new ApiResponse(200, "", "Transaction Updated"));
  } else {
    // Create a new transaction

    if (type.name.trim().toLowerCase() === "debit".toLowerCase()) {
      // Update Cash balance if payment method is "cash"
      if (payment_method.name.trim().toLowerCase() === "cash".toLowerCase()) {
        //const cashAccount = await User_detail.findOne({user_master:req.user._id}).session(session);
        if (!cashAccount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        if (parseFloat(cashAccount.cash_amount) < parseFloat(amount)) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account can not be negative" },
            ]));
        }

        cashAccount.cash_amount =
          parseFloat(cashAccount.cash_amount) - parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (
        payment_method.name.trim().toLowerCase() === "bank".toLowerCase()
      ) {
        const bankAmount = await Bank.findOne({ _id: bank }).session(session);
        if (!bankAmount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        if (parseFloat(bankAmount.current_balance) < parseFloat(amount)) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Bank account can not be negative" },
            ]));
        }

        bankAmount.current_balance =
          parseFloat(bankAmount.current_balance) - parseFloat(amount);
        await bankAmount.save({ session });
      }
    } else if (type.name.trim().toLowerCase() === "credit".toLowerCase()) {
      if (payment_method.name.trim().toLowerCase() === "cash".toLowerCase()) {
        //const cashAccount = await Cash.findOne().session(session);
        if (!cashAccount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        // if (parseFloat(cashAccount.cash_amount) < parseFloat(amount)) {
        //   return res
        //   .status(200)
        //   .json(
        //     new ApiError(400, "addEditTransaction Fail", [
        //       {  message: "Cash account can not be negative" },
        //     ]));
        // }
console.log("cash Deposite credit object")
        cashAccount.cash_amount =
          parseFloat(cashAccount.cash_amount) + parseFloat(amount); // Update the cash balance
        await cashAccount.save({ session });
      } else if (
        payment_method.name.trim().toLowerCase() === "bank".toLowerCase()
      ) {
        const bankAmount = await Bank.findOne({ _id: bank }).session(session);
        if (!bankAmount) {
          return res
          .status(200)
          .json(
            new ApiError(400, "addEditTransaction Fail", [
              {  message: "Cash account not found" },
            ]));
        }
        // if (parseFloat(bankAmount.current_balance) < parseFloat(amount)) {
        //   throw new ApiError(400, "Bank account can not be negative");
        // }

        bankAmount.current_balance =
          parseFloat(bankAmount.current_balance) + parseFloat(amount);
        await bankAmount.save({ session });
      }
    }
    await Transaction.create(
      [
        {
          _id,
          amount,
          category,
          transaction_type,
          payment_type,
          bank,
          date,
          description,
          user_master: req.user._id
        },
      ],
      { session }
    );
    await session.commitTransaction(); // Commit the transaction
    session.endSession();

    return res.status(201).json(new ApiResponse(200, "", "Transaction saved"));
  }
});
const selfTransfer = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  const { fromBankId, toBankId, amount } = req.body;

  if (!fromBankId || !toBankId || !amount) {

    return res
    .status(200)
    .json(
      new ApiError(400, "selfTransfer Fail", [
        {  message: "Missing required fields" },
      ]));
  }

  await session.withTransaction(async () => {
    const [fromBank, toBank] = await Promise.all([
      Bank.findOne({_id:fromBankId,user_master: req.user._id}).session(session),
      Bank.findOne({_id:toBankId,user_master: req.user._id}).session(session),
    ]);

    if (!fromBank || !toBank) {
      return res
      .status(200)
      .json(
        new ApiError(400, "selfTransfer Fail", [
          {  message: "Invalid bank account" },
        ]));
    }

    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res
      .status(200)
      .json(
        new ApiError(400, "selfTransfer Fail", [
          {  message: "Invalid transfer amount" },
        ]));
    }

    if (parseFloat(fromBank.current_balance) < transferAmount) {
      // throw new Error("Insufficient balance in the source bank");
      return res
        .status(200)
        .json(
          new ApiError(400, "Withdraw failed: insufficient balance", [
            { message: "Not enough funds" },
          ])
        );
    }

    fromBank.current_balance =
      parseFloat(fromBank.current_balance) - transferAmount;
    toBank.current_balance =
      parseFloat(toBank.current_balance) + transferAmount;

    await Promise.all([fromBank.save({ session }), toBank.save({ session })]);
  });

  session.endSession();

  return res
    .status(201)
    .json(new ApiResponse(200, null, "Transaction successful"));
});
const addEditCash = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  const { cash } = req.body;
  const userId = req.user._id;

  if (!userId || cash === undefined) {
    return res
    .status(200)
    .json(
      new ApiError(400, "addEditCash Fail", [
        {  message: "Missing user ID or amount" },
      ]));
  }

  await session.withTransaction(async () => {
    const userDetail = await User_detail.findOne({
      user_master: userId,
    }).session(session);

    if (!userDetail) {
      return res
      .status(200)
      .json(
        new ApiError(400, "addEditCash Fail", [
          {  message: "User details not found" },
        ]));
    }

    const newAmount = parseFloat(cash);

    if (isNaN(newAmount) || newAmount < 0) {
      return res
      .status(200)
      .json(
        new ApiError(400, "addEditCash Fail", [
          {  message: "Invalid amount value" },
        ]));
    }

    userDetail.cash_amount = newAmount;
    await userDetail.save({ session });
  });

  session.endSession();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cash amount updated successfully"));
});

const depositCash = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const { bankId, amount } = await req.body;
  await session.withTransaction(async () => {
    const bankDetail = await Bank.findOne({ _id: bankId,user_master: req.user._id });
    const cash = await User_detail.findOne({user_master : req.user._id})
    cash.cash_amount = parseFloat(cash.cash_amount) - parseFloat(amount)
    if (!bankDetail) {
      return res
      .status(200)
      .json(
        new ApiError(400, "depositCash Fail", [
          {  message: "Bank details not found" },
        ]));
    }
    const newAmount = parseFloat(amount);
    
    if (isNaN(newAmount) || newAmount < 0) {
      return res
      .status(200)
      .json(
        new ApiError(400, "depositCash Fail", [
          {  message: "Invalid amount value" },
        ]));
    }
    bankDetail.current_balance =
    parseInt(bankDetail.current_balance) + newAmount;
    bankDetail.save({ session });
    cash.save({session})
  });
  session.endSession();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Deposit successfully"));
});
const deleteTransaction = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const { _id } = await req.body;
  // console.log("transaction_Detail",req.body)
  await session.withTransaction(async () => {
    const transactionDetail = await Transaction.findOne({_id,user_master: req.user._id})
    if(!transactionDetail){
                return res
          .status(200)
          .json(
            new ApiError(400, "deleteTransaction Fail", [
              {  message: "transaction deatil not found" },
            ]));
    }
    const transactionType = await TransactionType.findById({_id: transactionDetail.transaction_type})
    const paymentMethod = await PaymentType.findById({_id: transactionDetail.payment_type})
    const cash = await User_detail.findOne({user_master: req.user._id})
    const bank = await Bank.findOne({_id:transactionDetail.bank,user_master: req.user._id})
    if(transactionType.name.trim().toLowerCase() == "credit".toLowerCase()){
      if(paymentMethod.name.trim().toLowerCase() == "cash".toLowerCase()){
        if(!cash){
          return res
          .status(200)
          .json(
            new ApiError(400, "deleteTransaction Fail", [
              {  message: "cash not found" },
            ]));
        }
        cash.cash_amount = parseFloat(cash.cash_amount) -  parseFloat(transactionDetail.amount) 
        cash.save({ session });
      }
      else if(paymentMethod.name.trim().toLowerCase() == "bank".toLowerCase()){
        if(!bank){
          return res
          .status(200)
          .json(
            new ApiError(400, "deleteTransaction Fail", [
              {  message: "bank not found" },
            ]));
        }
        bank.current_balance = parseFloat(bank.current_balance) - parseFloat(transactionDetail.amount)
        bank.save({ session });

      }
    }
    else if(transactionType.name.trim().toLowerCase() == "debit".toLowerCase()){
      if(paymentMethod.name.trim().toLowerCase() == "cash".toLowerCase()){
        if(!cash){
          return res
          .status(200)
          .json(
            new ApiError(400, "deleteTransaction Fail", [
              {  message: "cash not found" },
            ]));
        }
        cash.cash_amount = parseFloat(cash.cash_amount) +  parseFloat(transactionDetail.amount) 
        cash.save({ session });

      }
      else if(paymentMethod.name.trim().toLowerCase() == "bank".toLowerCase()){
        if(!bank){
          return res
          .status(200)
          .json(
            new ApiError(400, "deleteTransaction Fail", [
              {  message: "bank not found" },
            ]));
        }
        bank.current_balance = parseFloat(bank.current_balance) + parseFloat(transactionDetail.amount)
        bank.save({ session });
      }
    }
    const transaction = await Transaction.findByIdAndDelete({ _id });
    if (!transaction) {
      return res
      .status(200)
      .json(
        new ApiError(400, "deleteTransaction Fail", [
          {  message: "Transaction not found" },
        ]));
    }
  });
  session.endSession();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Delete successfully"));
});
const withdrawCash = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const { bankId, amount } = await req.body;
  await session.withTransaction(async () => {
    const bankDetail = await Bank.findOne({ _id: bankId,user_master: req.user._id });
    const cash = await User_detail.findOne({user_master : req.user._id})
    cash.cash_amount = parseFloat(cash.cash_amount) + parseFloat(amount)
    if (!bankDetail) {
      return res
      .status(200)
      .json(
        new ApiError(400, "withdrawCash Fail", [
          {  message: "Bank details not found" },
        ]));
    }
    const newAmount = parseFloat(amount);

    if (isNaN(newAmount) || newAmount < 0) {
      return res
      .status(200)
      .json(
        new ApiError(400, "withdrawCash Fail", [
          {  message: "Invalid amount value" },
        ]));
    }
    if(bankDetail.current_balance < newAmount){
            return res
      .status(200)
      .json(
        new ApiError(400, "cash balance is low", [
          {  message: "invalid amount" },
        ]));
    }
    bankDetail.current_balance =
      parseInt(bankDetail.current_balance) - newAmount;
    bankDetail.save({ session });
    cash.save({session})
  });
  session.endSession();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Withdraw successfully"));
});
const getCashBankAmount = asyncHandler(async (req, res) => {
  const cash = await User_detail.findOne({ user_master: req.user._id });
  const banks = await Bank.find({user_master: req.user._id});
  const totalBalance = banks.reduce(
    (total, bank) => total + parseFloat(bank.current_balance || 0),
    0
  );
  const cashBankAmount = {
    cashAmount: parseFloat(cash?.cash_amount || 0),
    bankAmount: totalBalance,
  };
  if (!cash) {
    return res
      .status(200)
      .json(
        new ApiError(400, "getCashBankAmount fail", [
          { message: "User Not Found" },
        ])
      );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, cashBankAmount, "cash found"));
});
const exportExcelReport = asyncHandler(async (req, res) => {
  // 1) Fetch your data
  const {fromDate,toDate} = await req.body;
  const typesList = await Transaction.find({
  date: {
    $gte: new Date(fromDate),
    $lte: new Date(toDate),
  },
}).populate([
  { path: "bank" },
  { path: "category" },
  { path: "transaction_type" },
  { path: "payment_type" },
]);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // 3) Define columns (header text + keys + widths)
  worksheet.columns = [
    { header: "Date", key: "date", width: 30 },
    { header: "Transaction Type", key: "transactionType", width: 30 },
    { header: "Category", key: "category", width: 30 },
    { header: "Payment Type", key: "paymentType", width: 30 },
    { header: "Bank", key: "bank", width: 30 },
    { header: "Amount", key: "amount", width: 30 },
    { header: "Description", key: "description", width: 50 },
  ];

  //    // console.log("object",typesList)
// ow(1).font = { bold: true };

  // 5) Add your data rows
  typesList.forEach((type) => {
    worksheet.addRow({
      date: type.date,
      transactionType: type.transaction_type.name,
      category: type.category.name,
      paymentType: type.payment_type.name,
      bank: type.bank != null ? type.bank.bank_name : "",
      amount: type.amount,
      description: type.description,
    });
  });

  // 6) Apply thin borders around every cell
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // 7) Send the workbook as an .xlsx download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="Report.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
});

export {
  getTransaction,
  getTransactionById,
  getRecentTransaction,
  addEditTransaction,
  exportExcelReport,
  deleteTransaction,
  selfTransfer,
  addEditCash,
  depositCash,
  withdrawCash,
  getCashBankAmount,
};
