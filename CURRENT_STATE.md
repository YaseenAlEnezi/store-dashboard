# Current State of Purchasing and Sales Pages

## Overview

Both pages have been updated to use a custom button-based approach instead of Ant Design Tabs, providing a cleaner and more consistent user experience.

## Purchasing Page (`/purchasing`)

- **Location**: `store-dashboard/src/pages/purchasing/purchasing.jsx`
- **Features**:
  - Custom buttons to switch between "فاتورة شراء" (Purchase Invoice) and "فاتورة إرجاع" (Purchase Return)
  - Supplier information form (name, phone, notes/return reason)
  - Product selection with barcode search
  - Quantity, purchase price, and selling price inputs
  - Automatic total calculation
  - Currency selection (IQD/USD)
  - Add/remove product rows
  - API integration for creating purchases and purchase returns

## Sales Page (`/sales`)

- **Location**: `store-dashboard/src/pages/sales/sales.jsx`
- **Features**:
  - Custom buttons to switch between "فاتورة بيع" (Sales Invoice) and "فاتورة إرجاع" (Sales Return)
  - Customer information form (name, phone, address for sales, return reason for returns)
  - Product selection with barcode search
  - Quantity and price inputs
  - Automatic total calculation
  - Currency selection (IQD/USD)
  - Add/remove product rows
  - API integration for creating sales and sales returns

## Key Changes Made

1. **Removed Ant Design Tabs**: Replaced with custom buttons for better control
2. **Consolidated UI**: Single form and table that adapts based on operation type
3. **Dynamic Labels**: Form labels and placeholders change based on operation type
4. **Consistent Layout**: Both pages now follow the same design pattern
5. **Improved UX**: Cleaner interface with better button placement

## Navigation

- Both pages are accessible from the main navbar
- Routes: `/purchasing` and `/sales`
- Navigation items: "المشتريات" (Purchasing) and "المبيعات" (Sales)

## API Endpoints

- **Purchasing**: `create-purchase`, `create-purchase-return`
- **Sales**: `create-sale`, `create-sale-return`

## Technical Details

- Built with React functional components
- Uses Ant Design for UI components
- React Query for data fetching
- Form validation with Ant Design Form
- Responsive design with Tailwind CSS
- RTL support for Arabic language
