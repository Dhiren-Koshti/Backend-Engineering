# BE-002-R — Performance & Lookup Strategy Benchmark

## Benchmark Results

Tested lookups across **150,000 mock employee records**:

```text
========================================
Array lookup: 1087.48 ms
Map lookup:   0.25 ms
========================================
```

---

## Performance Analysis & Q&A

### 1. What is the average-case complexity of `Array.find()`?
**$O(N)$ (Linear Time Complexity)**
`Array.find()` must iterate through the array elements sequentially from index `0` up to `N - 1` until it finds a matching `id`. On average, it checks $\frac{N}{2}$ items per lookup.

---

### 2. What is the average-case complexity of `Map.get()`?
**$O(1)$ (Constant Time Complexity)**
JavaScript `Map` is implemented using a hash table. It computes a key hash to access the exact memory bucket directly, completing lookups in constant time regardless of dataset size.

---

### 3. Why does `Map.get()` perform better for ID lookup?
`Map.get()` accesses the requested record directly via key hash indexing without scanning unrelated elements. While `Array.find()` gets progressively slower as dataset size grows ($O(N)$), `Map.get()` maintains instantaneous microsecond response times ($O(1)$) whether there are 10 items or 1,000,000 items.

---

### 4. Does changing to `Map` make `GET /employees` $O(1)$? Why or why not?
**No.** `GET /employees` returns all stored employee records.
Converting `employeesMap` values into a response list (`Array.from(employeesMap.values())`) must iterate through all $N$ entries in the Map. Therefore, fetching all employees remains **$O(N)$ time complexity**.

---

### 5. What happens to memory usage when you maintain both `employeesMap` and `emailMap`?
Memory usage **increases** because maintaining two separate Maps creates duplicate reference pointers for every employee in memory.

This represents the fundamental **Time-Space Tradeoff** in computer science:
- **Cost**: Slightly higher memory overhead (Space).
- **Gain**: Instantaneous $O(1)$ performance for both ID-based operations (`GET /:id`, `PUT /:id`, `DELETE /:id`) and Email uniqueness validations (`POST /employees`, `PUT /:id`).
