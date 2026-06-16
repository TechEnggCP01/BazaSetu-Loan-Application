# 🚀 BazarSetu- Multi-Step Loan Application System

A production-grade multi-step loan application platform built using React, TypeScript, React Hook Form, Zod, Zustand, and Tailwind CSS.

## 📌 Project Overview

LendSwift is a digital lending platform that allows users to apply for:

* Personal Loans
* Home Loans
* Business Loans

The application provides a seamless, secure, and responsive experience through an 8-step guided application process with real-time validation, conditional rendering, document uploads, e-signature capture, and auto-save functionality.

---

## ✨ Features

### Multi-Step Loan Application Wizard

* 8-step application flow
* Progress tracking
* Step validation before navigation
* Resume application functionality

### Loan Types

* Personal Loan
* Home Loan
* Business Loan

Each loan type has different validation rules and eligibility requirements.

### Real-Time Validation

* React Hook Form
* Zod schema validation
* Cross-step dependency validation
* Conditional field validation

### KYC Verification

* PAN Verification Simulation
* Aadhaar Verification Simulation
* Verification status indicators
* Aadhaar consent validation

### Address Management

* PIN code lookup simulation
* Auto-filled city and state
* Permanent address duplication
* Previous address conditional rendering

### Employment & Income Module

Dynamic forms based on:

* Salaried
* Self-Employed
* Business Owner

### Document Upload System

* Drag & Drop Upload
* Image Preview
* PDF Preview
* File Validation
* Upload Progress Simulation
* Client-side Compression

### E-Signature Capture

* Signature Canvas
* Mobile Touch Support
* PNG Export
* Signature Validation

### Auto Save & Resume

* LocalStorage Persistence
* Auto Save Every 30 Seconds
* Resume Previous Session
* Draft Recovery

### Accessibility

* WCAG 2.1 AA Compliant
* Keyboard Navigation
* ARIA Labels
* Screen Reader Support

### Responsive Design

* Mobile First
* Tablet Support
* Desktop Optimized

---

# 🛠 Tech Stack

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| React 18               | Frontend Framework      |
| TypeScript             | Type Safety             |
| React Hook Form        | Form Management         |
| Zod                    | Schema Validation       |
| Zustand                | Global State Management |
| Tailwind CSS           | Styling                 |
| React Dropzone         | File Upload             |
| React Signature Canvas | E-Signature             |
| Framer Motion          | Animations              |
| Lucide React           | Icons                   |
| Cypress                | E2E Testing             |

---

# 📂 Project Structure

```bash
src/
│
├── components/
│   ├── forms/
│   ├── ui/
│   ├── layout/
│   ├── upload/
│   └── signature/
│
├── pages/
│   └── LoanApplication/
│
├── steps/
│   ├── Step1LoanDetails/
│   ├── Step2PersonalInfo/
│   ├── Step3KYC/
│   ├── Step4Address/
│   ├── Step5Employment/
│   ├── Step6CoApplicant/
│   ├── Step7Documents/
│   └── Step8Review/
│
├── store/
│   └── loanStore.ts
│
├── schemas/
│   ├── loanSchema.ts
│   ├── kycSchema.ts
│   └── employmentSchema.ts
│
├── services/
│   ├── kycService.ts
│   ├── pinCodeService.ts
│   └── storageService.ts
│
├── hooks/
│
├── utils/
│
├── types/
│
└── tests/
```

---

# 📋 Application Steps

## Step 1 – Loan Details

* Loan Type Selection
* Loan Amount
* Loan Tenure
* Loan Purpose
* Referral Code

---

## Step 2 – Personal Information

* Full Name
* Date of Birth
* Gender
* Marital Status
* Parent Details
* Email
* Mobile Number

---

## Step 3 – KYC Verification

* PAN Verification
* Aadhaar Verification
* Aadhaar Consent
* Passport
* Voter ID

---

## Step 4 – Address Information

* Current Address
* PIN Code Lookup
* City
* State
* Residence Type
* Permanent Address

---

## Step 5 – Employment & Income

### Salaried

* Company Name
* Designation
* Salary
* Experience

### Self-Employed

* Business Details
* Turnover
* Years in Business

---

## Step 6 – Co-Applicant Details

Displayed conditionally based on:

* Marital Status
* Loan Amount

---

## Step 7 – Documents & Signature

* PAN Upload
* Aadhaar Upload
* Address Proof
* Income Proof
* E-Signature Capture

---

## Step 8 – Review & Submit

* Loan Summary
* KYC Summary
* Income Summary
* Documents Summary
* Signature Preview
* Consent Collection

---

# 🔒 Security Features

* Form Data Encryption
* Secure LocalStorage Handling
* Input Sanitization
* Validation at Every Step
* File Type Verification
* File Size Restrictions

---

# 🧪 Testing

### Cypress E2E Coverage

* Personal Loan Flow
* Home Loan Flow
* Business Loan Flow
* Validation Testing
* Auto Save Recovery
* File Upload Testing
* Signature Capture Testing
* Accessibility Testing

### Run Tests

```bash
npm run cypress
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/lendswift-loan-app.git
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# 📈 Performance Goals

| Metric              | Target |
| ------------------- | ------ |
| Completion Rate     | 85%+   |
| Lighthouse Score    | 90+    |
| Accessibility Score | 90+    |
| Mobile Performance  | 90+    |
| Test Coverage       | 80%+   |

---

# 👨‍💻 Author

Developed as part of the Front-End Developer Assessment Project.

### Company

LendSwift Digital Lending Platform Simulation

### Assignment

Multi-Step Loan Application Form Engineering Challenge

---

## 📜 License

This project is created for educational and assessment purposes only.
