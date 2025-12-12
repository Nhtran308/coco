import { useState, useEffect } from "react";
import axios from "axios";
import {
  Hero,
  CategoryNavigation,
  LatestProduct,
  BestProduct,
} from "../../components/user";

const Home = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await axios.get("/api/user/check-subscription");
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
      <Hero />
      <CategoryNavigation />
      <LatestProduct />
      <BestProduct />
    </div>
  );
};

export default Home;
