import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const useGeoLocation = () => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: "", lng: "" },
  });

  const [error, setError] = useState(null);

  const onSuccess = (location) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    });
  };

  const onError = (error) => {
    setError({
      code: error.code,
      message: error.message,
    });
    setLocation((prev) => ({ ...prev, loaded: true }));
    toast.error("Location access denied. Showing default results.");
  };

  //this function triggers the browser prompt
  const getLocation = () => {
    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  };

  return { location, error, getLocation };
};

export default useGeoLocation;