require("dotenv").config();
const express = require("express");
const router = new express.Router();
const Rate = require("../models/rates");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

const monthName = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

router.post(
  "/addrate",
  [
    body("unitsConsumed", "Consumed units must be a number").isNumeric(),
    body("slabUsed", "Slab used cannot be blank").exists(),
    body("billedMonth", "Billed month cannot be blank").exists(),
  ],
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    const { unitsConsumed, slabUsed, billedMonth } = req.body;

    try {
      let userId = req.id;
      let totalRate = 0;
      let slab = slabUsed.slabValues;

      const userRates = await Rate.find({ userId: userId });
      let currentMonthOccurrence = userRates.filter((rate) => {
        return (
          rate.billedMonth.month === billedMonth.month &&
          rate.billedMonth.year === billedMonth.year
        );
      });

      if (currentMonthOccurrence.length !== 0) {
        return res.status(400).json({
          success,
          errors: [
            {
              msg: `Rates already calculated for the month of ${
                monthName[billedMonth.month]
              }`,
            },
          ],
        });
      }

      if (unitsConsumed <= 100) {
        totalRate = slab[0] * unitsConsumed;
      } else if (unitsConsumed <= 250) {
        totalRate = slab[0] * 100;
        totalRate += slab[1] * (unitsConsumed - 100);
      } else if (unitsConsumed <= 500) {
        totalRate = slab[0] * 100;
        totalRate += slab[1] * 150;
        totalRate += slab[2] * (unitsConsumed - 250);
      } else if (unitsConsumed > 500) {
        totalRate = slab[0] * 100;
        totalRate += slab[1] * 150;
        totalRate += slab[2] * 250;
        totalRate += slab[3] * (unitsConsumed - 500);
      }
      await Rate.create({
        userId: userId,
        unitsConsumed,
        slabUsed,
        totalRate: totalRate,
        billedMonth,
      });

      success = true;
      res.status(200).json({ success, msg: "Data added successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ success, errors: [{ msg: "Internal Server Error" }] });
    }
  }
);
router.get("/getrates", fetchuser, async (req, res) => {
  let success = false;
  try {
    let userId = req.id;
    const user = await Rate.find({ userId: userId });
    success = true;
    res.status(200).json({ success, userRates: user });
  } catch (error) {
    res
      .status(500)
      .json({ success, errors: [{ msg: "Internal Server Error" }] });
  }
});
router.get("/chartdata", fetchuser, async (req, res) => {
  let success = false;
  try {
    let userId = req.id;
    const user = await Rate.find({ userId: userId });
    // Get all the years
    let years = user.map((data) => {
      return data.billedMonth.year;
    });
    // Get unique years
    let uniqueYears = years.filter((year, index, array) => {
      return array.indexOf(year) === index;
    });
    // Sorting
    uniqueYears.sort(function (a, b) {
      return a - b;
    });

    // Group data w.r.t unique years
    let array = [];
    for (let i = 0; i < uniqueYears.length; i++) {
      array.push(
        user.filter((data) => {
          return data.billedMonth.year === uniqueYears[i];
        })
      );
    }

    // Sort data w.r.t month and send final response
    let response = [];
    for (let i = 0; i < array.length; i++) {
      array[i].sort(function (a, b) {
        let x = a.billedMonth.month;
        let y = b.billedMonth.month;
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      });

      response.push({
        year: array[i][0].billedMonth.year,
        userRates: array[i].map((object) => {
          return {
            month: monthName[object.billedMonth.month],
            Units: object.unitsConsumed,
            Rates: object.totalRate,
          };
        }),
      });
    }
    success = true;
    res.status(200).json({ success, chartData: response });
  } catch (error) {
    res
      .status(500)
      .json({ success, errors: [{ msg: "Internal Server Error" }] });
  }
});
module.exports = router;
