// Form and address constants
const BILLING_FORM_NAME = 'billing';
const SHIPPING_FORM_NAME = 'shipping';
const TERMS_AND_CONDITIONS_FORM_NAME = 'termsAndConditions';
const LOGIN_FORM_NAME = 'login';
const BILLING_ADDRESS_DATA_KEY = `${BILLING_FORM_NAME}_addressData`;
const SHIPPING_ADDRESS_DATA_KEY = `${SHIPPING_FORM_NAME}_addressData`;
const TERMS_AND_CONDITIONS_FORM_NAME_FULL = 'checkout-terms-and-conditions__form';

// Timing constants
const DEBOUNCE_TIME = 1000;
const ADDRESS_INPUT_DEBOUNCE_TIME = 500;

// Block and styling constants
export const CHECKOUT_BLOCK = 'checkout__block';
const CHECKOUT_EMPTY_CLASS = 'checkout__content--empty';
const CHECKOUT_ERROR_CLASS = 'checkout__content--error';
const CHECKOUT_HEADER_CLASS = 'checkout-header';
export const ORDER_CONFIRMATION_BLOCK = 'order-confirmation__block';

// Default values
const USER_TOKEN_COOKIE_NAME = 'auth_dropin_user_token';

export {
  // Form and address constants
  ADDRESS_INPUT_DEBOUNCE_TIME,
  BILLING_ADDRESS_DATA_KEY,
  BILLING_FORM_NAME,
  LOGIN_FORM_NAME,
  SHIPPING_ADDRESS_DATA_KEY,
  SHIPPING_FORM_NAME,
  TERMS_AND_CONDITIONS_FORM_NAME,

  // Timing constants
  DEBOUNCE_TIME,

  // Block and styling constants
  CHECKOUT_EMPTY_CLASS,
  CHECKOUT_ERROR_CLASS,
  CHECKOUT_HEADER_CLASS,

  // Default values
  USER_TOKEN_COOKIE_NAME,
};
