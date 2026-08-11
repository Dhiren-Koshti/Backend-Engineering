const {
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
  searchEmployeesService,
} = require("../../services/employeeService");
const AppError = require("../../utils/AppError");

describe("Employee Service Unit Tests", () => {
  const sampleEmployee = {
    name: "Alice Smith",
    email: "alice@company.com",
    department: "Engineering",
    role: "Backend Engineer",
  };

  it("should create a new employee successfully", () => {
    const emp = createEmployeeService(sampleEmployee);

    expect(emp.id).toBe(1);
    expect(emp.name).toBe("Alice Smith");
    expect(emp.email).toBe("alice@company.com");
    expect(emp.department).toBe("Engineering");
    expect(emp.role).toBe("Backend Engineer");
  });

  it("should throw AppError 400 on duplicate employee email creation", () => {
    createEmployeeService(sampleEmployee);

    expect(() => createEmployeeService(sampleEmployee)).toThrow(AppError);
  });

  it("should retrieve employee by ID", () => {
    const created = createEmployeeService(sampleEmployee);
    const fetched = getEmployeeByIdService(created.id);

    expect(fetched).toEqual(created);
  });

  it("should throw AppError 404 when getting non-existent employee ID", () => {
    expect(() => getEmployeeByIdService(999)).toThrow(AppError);
  });

  it("should update employee data successfully", () => {
    const created = createEmployeeService(sampleEmployee);
    const updated = updateEmployeeService(created.id, {
      role: "Senior Backend Engineer",
    });

    expect(updated.role).toBe("Senior Backend Engineer");
    expect(updated.name).toBe("Alice Smith");
  });

  it("should throw AppError 404 updating non-existent employee", () => {
    expect(() =>
      updateEmployeeService(999, { name: "Non Existent" })
    ).toThrow(AppError);
  });

  it("should delete employee by ID", () => {
    const created = createEmployeeService(sampleEmployee);
    const deleted = deleteEmployeeService(created.id);

    expect(deleted.id).toBe(created.id);
    expect(() => getEmployeeByIdService(created.id)).toThrow(AppError);
  });

  it("should throw AppError 404 deleting non-existent employee", () => {
    expect(() => deleteEmployeeService(999)).toThrow(AppError);
  });

  describe("Search & Pagination Filtering Unit Tests", () => {
    beforeEach(() => {
      createEmployeeService({
        name: "John Doe",
        email: "john@company.com",
        department: "Engineering",
        role: "Backend Engineer",
      });
      createEmployeeService({
        name: "Johnny Depp",
        email: "johnny@company.com",
        department: "Engineering",
        role: "Frontend Engineer",
      });
      createEmployeeService({
        name: "Sarah Connor",
        email: "sarah@company.com",
        department: "Product",
        role: "Product Manager",
      });
    });

    it("should filter employees by case-insensitive partial name search", () => {
      const result = searchEmployeesService({ name: "john" });

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should filter employees by department", () => {
      const result = searchEmployeesService({ department: "Engineering" });

      expect(result.data.length).toBe(2);
    });

    it("should filter employees by role", () => {
      const result = searchEmployeesService({ role: "Product Manager" });

      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("Sarah Connor");
    });

    it("should combine name, department, and role filters", () => {
      const result = searchEmployeesService({
        name: "john",
        department: "Engineering",
        role: "Frontend Engineer",
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("Johnny Depp");
    });

    it("should paginate search results accurately", () => {
      const page1 = searchEmployeesService({ page: 1, limit: 2 });
      expect(page1.data.length).toBe(2);
      expect(page1.pagination.total).toBe(3);
      expect(page1.pagination.totalPages).toBe(2);

      const page2 = searchEmployeesService({ page: 2, limit: 2 });
      expect(page2.data.length).toBe(1);
    });
  });
});
