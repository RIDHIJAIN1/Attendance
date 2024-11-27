const Payroll = require("../models/Payroll");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require('mongoose');

const createOrUpdatePayroll=async(req, res)=> {

  const {employeeId} = req.params;
  const {month} = req.body

  console.log(` This is employee id ${employeeId} `);
  console.log(` This is month ${month} `);

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }


  try {

    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(`${month}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    // Step 1: Aggregate total hours and overtime for the given employee and month
    const attendanceData = await Attendance.aggregate([
   
      {
        $match: {
          employeeId:new mongoose.Types.ObjectId(employeeId),
          
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$totalHours' }, // Sum totalHours for the month
          overtimeHours: { $sum: '$overtimeHours' }, // Sum overtimeHours for the month (if stored in attendance)
        },
      },
    ]);
    console.log(`This is attendance data  ${attendanceData}`)
    // If no attendance records are found, set totalHours and overtimeHours to 0
    const totalHours = attendanceData.length > 0 ? attendanceData[0].totalHours : 0;
    const overtimeHours = attendanceData.length > 0 ? attendanceData[0].overtimeHours : 0;

    console.log(` This is totalhour ${totalHours} `);
    console.log(` This is overtime hour ${overtimeHours} `);
    // Step 2: Fetch employee details to get hourly_rate and advance_pay
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const advancePay = employee.advance_pay || 0; // Default to 0 if not set
    const hourlyRate = employee.hourly_rate || 0; // Default to 0 if not set

    console.log(` This is advancePay ${advancePay} `);
    console.log(` This is hourlyRate hour ${hourlyRate} `);

    // Step 3: Calculate totalPay (regular pay + overtime pay)
    let totalPay = totalHours * hourlyRate; // Regular pay for regular hours

    console.log(` This is totalPay ${totalPay} `);


    // Calculate overtime pay if any overtime hours exist
    if (overtimeHours > 0) {
      const overtimeRate = hourlyRate * 1.2; // Assume overtime is paid at 1.5x the regular rate
      totalPay += overtimeHours * overtimeRate; // Add overtime pay
    }

    // Step 4: Calculate netPay (totalPay - advanceDeduction)
    let netPay = totalPay - advancePay;
  
    console.log(` This is netPay ${netPay} `);
    // Step 5: Check if Payroll already exists for the employee and month
    let payroll = await Payroll.findOne({ employeeId, month });

    if (!payroll) {
      // Create new payroll record if it doesn't exist
      payroll = new Payroll({
        employeeId,
        month,
        totalHours, // Set the totalHours from the attendance aggregation
        overtimeHours, // Set the overtimeHours
        totalPay, // Set the totalPay (calculated from totalHours + overtime)
        advanceDeduction: advancePay, // Use the employee's advance pay for the deduction
        netPay, // Set the netPay (totalPay - advanceDeduction)
        isPaid: true, // Assuming payroll isn't paid yet
      });
    } else {
      // If payroll exists, update the totalHours, overtimeHours, and advanceDeduction
      payroll.totalHours = totalHours;
      payroll.overtimeHours = overtimeHours;
      payroll.totalPay = totalPay;
      payroll.advanceDeduction = advancePay;
      payroll.netPay = netPay;
    }

    // Step 6: Save the payroll record
    await payroll.save();
    console.log('Payroll created/updated successfully');

    res.status(200).json({
      message: 'Payroll created/updated successfully',
      payroll, // Optionally, return the saved payroll document
    });
  } catch (error) {
    console.error('Error creating/updating payroll:', error);
    res.status(500).json({ message: 'Error creating/updating payroll', error: error.message });
  
  }
}

  // const updatePayroll = async (payrollId, updateData) => {
  //   try {
  //     const payroll = await Payroll.findByIdAndUpdate(payrollId, updateData, {
  //       new: true,
  //       runValidators: true,
  //     });
  //     if (!payroll) throw new Error('Payroll record not found');
  //     return payroll;
  //   } catch (error) {
  //     throw new Error('Error updating payroll record: ' + error.message);
  //   }
  // };
  // const deletePayroll = async (payrollId) => {
  //   try {
  //     const payroll = await Payroll.findByIdAndDelete(payrollId);
  //     if (!payroll) throw new Error('Payroll record not found');
  //     return payroll;
  //   } catch (error) {
  //     throw new Error('Error deleting payroll record: ' + error.message);
  //   }
  // };
  // const getPayrollByMonth = async (month) => {
  //   try {
  //     const payrolls = await Payroll.find({ month }).populate('employeeId', 'name designation hourly_rate');
  //     return payrolls;
  //   } catch (error) {
  //     throw new Error('Error fetching payroll records: ' + error.message);
  //   }
  // };
  // const getPayrollByEmployee = async (employeeId) => {
  //   try {
  //     const payrolls = await Payroll.find({ employeeId }).sort({ month: -1 });
  //     return payrolls;
  //   } catch (error) {
  //     throw new Error('Error fetching payroll records for employee: ' + error.message);
  //   }
  // };
  // const calculateMonthlyPayroll = async (month) => {
  //   try {
  //     const payrollSummary = await Payroll.aggregate([
  //       { $match: { month } },
  //       {
  //         $group: {
  //           _id: null,
  //           totalHours: { $sum: '$totalHours' },
  //           totalOvertime: { $sum: '$overtimeHours' },
  //           totalPay: { $sum: '$totalPay' },
  //           totalAdvanceDeduction: { $sum: '$advanceDeduction' },
  //           totalNetPay: { $sum: '$netPay' },
  //         },
  //       },
  //     ]);
  //     return payrollSummary[0] || {};
  //   } catch (error) {
  //     throw new Error('Error calculating monthly payroll: ' + error.message);
  //   }
  // };
  // const markAsPaid = async (payrollId) => {
  //   try {
  //     const payroll = await Payroll.findByIdAndUpdate(payrollId, { isPaid: true }, { new: true });
  //     if (!payroll) throw new Error('Payroll record not found');
  //     return payroll;
  //   } catch (error) {
  //     throw new Error('Error marking payroll as paid: ' + error.message);
  //   }
  // };
  // const generatePayrollSlip = async (employeeId, month) => {
  //   try {
  //     const payroll = await Payroll.findOne({ employeeId, month }).populate('employeeId', 'name designation hourly_rate');
  //     if (!payroll) throw new Error('Payroll record not found for the specified employee and month');
      
  //     return {
  //       employee: payroll.employeeId.name,
  //       designation: payroll.employeeId.designation,
  //       hourlyRate: payroll.employeeId.hourly_rate,
  //       totalHours: payroll.totalHours,
  //       overtimeHours: payroll.overtimeHours,
  //       totalPay: payroll.totalPay,
  //       advanceDeduction: payroll.advanceDeduction,
  //       netPay: payroll.netPay,
  //       isPaid: payroll.isPaid,
  //       month: payroll.month,
  //     };
  //   } catch (error) {
  //     throw new Error('Error generating payroll slip: ' + error.message);
  //   }
  // };
  // const getUnpaidPayrolls = async () => {
  //   try {
  //     const unpaidPayrolls = await Payroll.find({ isPaid: false }).populate('employeeId', 'name designation');
  //     return unpaidPayrolls;
  //   } catch (error) {
  //     throw new Error('Error fetching unpaid payrolls: ' + error.message);
  //   }
  // };
  // const generateAnnualReport = async (year) => {
  //   try {
  //     const annualReport = await Payroll.aggregate([
  //       { $match: { month: { $regex: `^${year}` } } },
  //       {
  //         $group: {
  //           _id: '$employeeId',
  //           totalHours: { $sum: '$totalHours' },
  //           totalOvertime: { $sum: '$overtimeHours' },
  //           totalPay: { $sum: '$totalPay' },
  //           totalAdvanceDeduction: { $sum: '$advanceDeduction' },
  //           totalNetPay: { $sum: '$netPay' },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'employees',
  //           localField: '_id',
  //           foreignField: '_id',
  //           as: 'employeeDetails',
  //         },
  //       },
  //       { $unwind: '$employeeDetails' },
  //       {
  //         $project: {
  //           employeeName: '$employeeDetails.name',
  //           designation: '$employeeDetails.designation',
  //           totalHours: 1,
  //           totalOvertime: 1,
  //           totalPay: 1,
  //           totalAdvanceDeduction: 1,
  //           totalNetPay: 1,
  //         },
  //       },
  //     ]);
  //     return annualReport;
  //   } catch (error) {
  //     throw new Error('Error generating annual payroll report: ' + error.message);
  //   }
  // };

  module.exports={
    createOrUpdatePayroll
    // createPayroll,
    // generateAnnualReport,
    // generatePayrollSlip,
    // getPayrollByMonth,
    // getUnpaidPayrolls,
    // markAsPaid,
    // updatePayroll,
    // deletePayroll,
    // getPayrollByEmployee,
    // calculateMonthlyPayroll
  }
                  
  