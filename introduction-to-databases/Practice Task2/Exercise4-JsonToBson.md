# Exercise 4: JSON → BSON (proper types)

Given JSON (the prompt’s `items` array looked cut off; assuming it should be two strings):

```json
{
  "orderId": "12345",
  "orderDate": "2024-01-15",
  "totalAmount": "99.99",
  "items": ["item1", "item2"]
}
```

## 1) MongoDB Shell style (BSON types)

```js
{
  orderId: 12345, // Int32 (number)
  orderDate: ISODate("2024-01-15T00:00:00.000Z"),
  totalAmount: NumberDecimal("99.99"),
  items: ["item1", "item2"]
}
```

## 2) MongoDB Extended JSON (safe for export/import)

```json
{
  "orderId": { "$numberInt": "12345" },
  "orderDate": { "$date": "2024-01-15T00:00:00.000Z" },
  "totalAmount": { "$numberDecimal": "99.99" },
  "items": ["item1", "item2"]
}
```

### Notes
- `orderDate` should be stored as a **Date** so you can do range queries and sorting.
- `totalAmount` is best as **Decimal128** (`NumberDecimal`) for money-like values.
- `orderId` can be a string if it’s truly an external identifier; here it’s numeric-looking so it’s shown as `Int32`.
