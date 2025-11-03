import React, { useState, useEffect } from "react";
import axios from "axios";
import Banner from "../components/Banner";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import StoreNavigation from "../components/StoreNavigation";

const Home = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await axios.get("/api/user/check-subscription"); // Đảm bảo đường dẫn chính xác
        if (response.data.success && response.data.isSubscribed) {
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscriptionStatus();
  }, []);

  return (
    <div className="mt-10">
      <Banner />
      <StoreNavigation />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      {!isSubscribed && <NewsletterBox />}{" "}
    </div>
  );
};

export default Home;
