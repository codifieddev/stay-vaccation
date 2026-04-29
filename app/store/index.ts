import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import packageReducer from "./features/packages/packageSlice";
import destinationReducer from "./features/destinations/destinationSlice";
import activityReducer from "./features/activities/activitySlice";
import hotelReducer from "./features/hotels/hotelSlice";
import categoryReducer from "./features/categories/categorySlice";
import regionReducer from "./features/regions/regionSlice";
import couponReducer from "./features/coupons/couponSlice";
import transferReducer from "./features/transfers/transferSlice";
import activityPageReducer from "./features/activityPages/activityPageSlice";
import businessSettingsReducer from "./features/businessSettings/businessSettingsSlice";
import adminReducer from "./features/admin/adminSlice";
import bookingReducer from "./features/bookings/bookingSlice";
import searchReducer from "./features/search/searchSlice";
import currencyReducer from "./features/currency/currencySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    packages: packageReducer,
    destinations: destinationReducer,
    activities: activityReducer,
    hotels: hotelReducer,
    categories: categoryReducer,
    regions: regionReducer,
    coupons: couponReducer,
    transfers: transferReducer,
    activityPages: activityPageReducer,
    businessSettings: businessSettingsReducer,
    admin: adminReducer,
    bookings: bookingReducer,
    search: searchReducer,
    currency: currencyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
