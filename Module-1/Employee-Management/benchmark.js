const { performance } = require("perf_hooks");

const DATA_SIZE = 150000; // 150,000 employees
const NUM_LOOKUPS = 1000; // 1,000 random lookups

console.log(`Populating ${DATA_SIZE.toLocaleString()} mock employee records...`);

const employeeArray = [];
const employeeMap = new Map();

for (let i = 1; i <= DATA_SIZE; i++) {
  const employee = {
    id: i,
    name: `Employee ${i}`,
    email: `employee${i}@company.com`,
    department: "Engineering",
    role: "Developer",
  };

  employeeArray.push(employee);
  employeeMap.set(i, employee);
}

// Generate target IDs to search for
const targetIds = Array.from({ length: NUM_LOOKUPS }, () =>
  Math.floor(Math.random() * DATA_SIZE) + 1
);

console.log(`Executing ${NUM_LOOKUPS.toLocaleString()} lookups...\n`);

// --- Benchmark 1: Array.find() ---
const arrayStartTime = performance.now();
for (const targetId of targetIds) {
  employeeArray.find((emp) => emp.id === targetId);
}
const arrayEndTime = performance.now();
const arrayDuration = (arrayEndTime - arrayStartTime).toFixed(2);

// --- Benchmark 2: Map.get() ---
const mapStartTime = performance.now();
for (const targetId of targetIds) {
  employeeMap.get(targetId);
}
const mapEndTime = performance.now();
const mapDuration = (mapEndTime - mapStartTime).toFixed(2);

console.log("========================================");
console.log(`Array lookup: ${arrayDuration} ms`);
console.log(`Map lookup:   ${mapDuration} ms`);
console.log("========================================");
