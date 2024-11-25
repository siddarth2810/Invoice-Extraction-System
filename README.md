
# Swipe assignment

![screenshot-20241125-125124Z-selected](https://github.com/user-attachments/assets/c6705201-8ef8-41e3-bfc7-852d84e5955e)

## PDF/Image Processing Strategy 
 First the images or pdfs are converted into buffer, and then to base64 which is sent to the gemini API
### Split Processing Approach
Instead of generating complete data for each product, we split into parallel operations:

```typescript
// 1. Extract Product Details Only
const productsResult = await model.generateContent([
  { inlineData: { data: extractedText } },
  { text: "Extract ONLY product details..." }
]);

// 2. Extract Invoice/Customer Metadata Separately
const metadataResult = await model.generateContent([
  { inlineData: { data: extractedText } },
  { text: "Extract ONLY customer and invoice details..." }
]);
```

### Why This Works Better? 

Traditional Approach (Inefficient):
- 40 products × (product details + invoice details) = 40  JSON objects
- High token usage, lots of repeated data

Our Approach:
- 40 products × (product details only) + 1 invoice detail
-  Reduced token usage and processing time

## Excel Processing Strategy 
```typescript
// 1. Convert Excel data to position-based arrays
const data = [
  // headers array (positions are key)
  ["Serial Number", "Product Name", "Qty", "Price with Tax"],
  //     [0]            [1]          [2]        [3]       
  
  // data rows maintain same positions
  ["RAY/23-24/275", "plain glass", "100.000", "590.00"]
]

// 2. Map headers to positions for reliable access
const headerPositions = new Map([
  ["Serial Number", 0],
  ["Product Name", 1],
  ["Qty", 2],
  ["Price with Tax", 3]
]);

// 3. AI maps Excel headers to required fields
const mapping = {
  products: {
    productName: "Product Name",  // Exact header match
    quantity: "Qty"              // Exact header match
  }
};

};
```


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/siddarth2810/data-extraction.git
   cd data-extraction
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Upload a file (PDF or image) for data extraction:
 


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the [Apache License 2.0](LICENSE).


