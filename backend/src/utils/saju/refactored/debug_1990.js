// Load the original source file code to examine it
const fs = require('fs');
const path = require('path');
const calculatorSource = fs.readFileSync('./monthStemCalculator.ts', 'utf-8');
console.log("=== Source code for 1990 special case ===");
const specialCaseMatch = calculatorSource.match(/\/\/ 1990年の処理.*?\n.*?if \(year === 1990\).*?\n.*?return \d+;/s);
console.log(specialCaseMatch ? specialCaseMatch[0] : "Special case for 1990 not found");
console.log("\n");

const { calculateMonthStem, getMonthStemBaseIndex } = require('./monthStemCalculator');
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// Use a hard-coded date object
const date1990 = new Date();
date1990.setFullYear(1990);
date1990.setMonth(0);
date1990.setDate(15);

console.log(`Date object created: ${date1990.toISOString()}`);
console.log(`Year from date: ${date1990.getFullYear()}`);

const yearStem = "庚";
console.log("Calling getMonthStemBaseIndex...");
const baseIdx = getMonthStemBaseIndex(yearStem, date1990);
console.log(`Result from getMonthStemBaseIndex: ${baseIdx}`);

const monthStem = calculateMonthStem(date1990, yearStem);
console.log(`Result from calculateMonthStem: ${monthStem}`);

console.log(`Date: ${date1990.toLocaleDateString()}`);
console.log(`Year: ${date1990.getFullYear()}`);
console.log(`Year Stem: ${yearStem}`);
console.log(`Base Index: ${baseIdx} (${STEMS[baseIdx]})`);
console.log(`Month Stem: ${monthStem}`);
console.log(`Expected: 丙 (2)`);

// Create date object for comparison
const otherDate = new Date(1990, 0, 15);
console.log(`\nComparison Date Check:`);
console.log(`Date 1990: ${date1990.toISOString()}`);
console.log(`Other Date: ${otherDate.toISOString()}`);
console.log(`Year 1990: ${date1990.getFullYear()}`);
console.log(`getFullYear() method result: ${date1990.getFullYear() === 1990}`);
console.log(`=== equality check: ${date1990.getFullYear() === 1990}`);
console.log(`String comparison: ${date1990.getFullYear().toString() === "1990"}`);
