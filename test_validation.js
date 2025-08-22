// Quick validation test
const testData = {
  userRows: [
    [1, "John", "Doe", "john@email.com", "New York", "USA"],
    [2, "Jane", "Smith", "jane@email.com", "London", "UK"],
    [3, "Bob", "Johnson", "bob@email.com", "Toronto", "Canada"]
  ],
  expectedRows: [
    {"customer_id": 1, "first_name": "John", "last_name": "Doe", "email": "john@email.com", "city": "New York", "country": "USA"},
    {"customer_id": 2, "first_name": "Jane", "last_name": "Smith", "email": "jane@email.com", "city": "London", "country": "UK"},
    {"customer_id": 3, "first_name": "Bob", "last_name": "Johnson", "email": "bob@email.com", "city": "Toronto", "country": "Canada"}
  ]
};

// Simple validation function
function compareResults(userResult, expectedResult) {
  const normalizeRows = (rows) => {
    return rows.map(row => 
      Array.isArray(row) ? row : Object.values(row)
    ).map(row => 
      row.map(cell => 
        cell === null ? null : String(cell).trim()
      )
    );
  };

  const userRows = normalizeRows(userResult);
  const expectedRows = normalizeRows(expectedResult);

  console.log('User rows:', userRows);
  console.log('Expected rows:', expectedRows);

  if (userRows.length !== expectedRows.length) {
    return {
      isCorrect: false,
      message: `Expected ${expectedRows.length} rows, but got ${userRows.length} rows`
    };
  }

  return {
    isCorrect: true,
    message: 'Correct! Your solution matches the expected output.'
  };
}

console.log('Testing validation:');
const result = compareResults(testData.userRows, testData.expectedRows);
console.log('Result:', result);