"use client";

import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { checkAuth } from "./features/auth/authThunks";
import { fetchPackages } from "./features/packages/packageThunks";
import { fetchDestinations, fetchTrending } from "./features/destinations/destinationThunks";
import { fetchActivities } from "./features/activities/activityThunks";
import { fetchHotels } from "./features/hotels/hotelThunks";
import { fetchCategories } from "./features/categories/categoryThunks";
import { fetchRegions } from "./features/regions/regionThunks";
import { fetchCoupons } from "./features/coupons/couponThunks";
import { fetchTransfers } from "./features/transfers/transferThunks";

import { fetchBusinessSettings } from "./features/businessSettings/businessSettingsThunks";
import { fetchAdminStats } from "./features/admin/adminThunks";
import { fetchCurrencies } from "./features/currency/currencyThunks";

export default function StoreInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchPackages());
    dispatch(fetchDestinations());
    dispatch(fetchTrending("India"));
    dispatch(fetchTrending("International"));
    dispatch(fetchActivities());
    dispatch(fetchHotels());
    dispatch(fetchCategories());
    dispatch(fetchRegions());
    dispatch(fetchCoupons());
    dispatch(fetchTransfers());
    dispatch(fetchCurrencies());

    dispatch(fetchBusinessSettings());
    dispatch(fetchAdminStats());
  }, [dispatch]);

  return null;
}
