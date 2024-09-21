import { ObjectId } from "mongodb"

export const carDetailsPipeline = (data: any) => {
    return [
        { $match: { _id: new ObjectId("your_car_id_here") } },
        {
          $lookup: {
            from: "hosts",
            localField: "host_id",
            foreignField: "_id",
            as: "hostDetails"
          }
        },
        { $unwind: "$hostDetails" },
        {
          $lookup: {
            from: "reviews",
            localField: "car_reviews",
            foreignField: "_id",
            as: "reviews.items"
          }
        },
        {
          $lookup: {
            from: "pricing_options",
            localField: "pricing_options",
            foreignField: "_id",
            as: "carPricingOptions"
          }
        },
        {
          $lookup: {
            from: "discount_options",
            localField: "discount_options",
            foreignField: "_id",
            as: "carDiscountOptions"
          }
        },
        {
          $lookup: {
            from: "locations",
            localField: "home_pickup_location",
            foreignField: "_id",
            as: "tripDetails.pickupAndReturn.items.pickupLocations"
          }
        },
        {
          $project: {
            carDetails: {
              make: 1,
              model: 1,
              type: 1,
              year: 1,
              car_rating: 1,
              trip_count: 1,
              car_features: 1,
              image_url: 1,
              reviews: 1,
            },
            hostDetails: 1,
            tripDetails: {
              price: 1,
              taxAndFees: 1,
              startDate: 1,
              endDate: 1,
              pickupAndReturn: 1,
              features: 1,
              extras: 1,
              protectionPlans: 1
            },
            carPricingOptions: 1,
            carDiscountOptions: 1
          }
        }
      ]
}