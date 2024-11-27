const Employee = require("../models/Employee");

const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body; // Get the employee data from the body
    const file = req.files.identityCard ? req.files.identityCard[0] : null; // Access the uploaded file

    // Validate required fields
    const { name, designation, join_date } = employeeData;
    if (!name || !designation || !join_date) {
      throw new Error('Name, designation, and join date are required');
    }

    const existingEmployee = await Employee.findOne({ name });
    if (existingEmployee) {
      throw new Error('An employee with this name already exists');
    }

    // Validate the uploaded file
    if(file){
    if ( !file.mimetype.startsWith('image/')) {
      throw new Error('Invalid or missing identity card image');
    }
    employeeData.identityCard = file.path; // Use the file path
  }
    // Add file path to employeeData
   

    // Create and save the employee
    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();
    return res.status(201).json(savedEmployee); // Return the saved employee
  } catch (error) {
    console.error('Error creating employee:', error.message);
    return res.status(400).json({ error: error.message });
  }
};

const getEmployees = async (req, res) => {
  try {
      // Get query parameters
      const { search, page = 1, limit = 10 } = req.query;

      // Convert page and limit to numbers
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Build the query
      const query = {};
      if (search) {
          // Assuming you're searching by name or designation
          query.$or = [
              { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
              { designation: { $regex: search, $options: 'i' } }
          ];
      }

      // Fetch employees with pagination and search
      const employees = await Employee.find(query)
          .limit(limitNumber)
          .skip((pageNumber - 1) * limitNumber)
          .exec();

      // Get the total count of employees for pagination
      const totalEmployees = await Employee.countDocuments(query);

      // Send response
      res.status(200).json({
          totalEmployees,
          totalPages: Math.ceil(totalEmployees / limitNumber),
          currentPage: pageNumber,
          employees
      });
  } catch (error) {
      console.error('Error fetching employees:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};



const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
      // Fetch the employee by ID
      const employee = await Employee.findById(id);
      console.log(id);
      console.log(employee);

      // Check if employee exists
      if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
      }

      // Send the employee data as a response
      return res.status(200).json(employee);
  } catch (error) {
      console.error('Error fetching employee:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
  }
};


  const updateEmployee = async ( req,res) => {

    const {id} = req.params;
    const updatedData = req.body;
    try {
      const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, { new: true });
      if (!updatedEmployee) {
        throw new Error('Employee not found');
      }
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };



  const deleteEmployee = async (req,res) => {
    const {id} = req.params
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(id);
      if (!deletedEmployee) {
        throw new Error('Employee not found');
      }
      return res.status(200).json(deletedEmployee);
    } catch (error) {
      console.error('Error deleting employee:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  const toggleEmployeeActiveStatus = async (req,res) => {
    const {id} = req.params;
    try {
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      employee.isActive = !employee.isActive;
      const updatedEmployee = await employee.save();
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error toggling status :', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeActiveStatus,
  };
  
  
  