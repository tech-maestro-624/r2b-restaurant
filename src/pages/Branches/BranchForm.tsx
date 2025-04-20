// src/pages/BranchForm.jsx

import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";

// Days of the week constant
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper function to initialize operational hours
const initializeOperationalHours = (existingOperationalHours) => {
  // Create a map for quick lookup
  const operationalHoursMap = {};
  if (existingOperationalHours && existingOperationalHours.length > 0) {
    existingOperationalHours.forEach((oh) => {
      operationalHoursMap[oh.dayOfWeek] = oh;
    });
  }

  // Initialize all days
  return daysOfWeek.map((day) => {
    if (operationalHoursMap[day]) {
      return {
        dayOfWeek: day,
        isOpen: operationalHoursMap[day].isOpen,
        periods: operationalHoursMap[day].isOpen
          ? [
              {
                openingTime:
                  operationalHoursMap[day].periods[0].openingTime || "00:00",
                closingTime:
                  operationalHoursMap[day].periods[0].closingTime || "00:00",
              },
            ]
          : [{ openingTime: "00:00", closingTime: "00:00" }],
      };
    } else {
      // If the day is not present, default to isOpen: false
      return {
        dayOfWeek: day,
        isOpen: false,
        periods: [{ openingTime: "00:00", closingTime: "00:00" }],
      };
    }
  });
};

const preventInvalidTab = (e: React.KeyboardEvent, isValid: boolean) => {
  if (!isValid && (e.key === 'Tab' || e.key === 'Enter')) {
    e.preventDefault();
    // Optional: Add a visual feedback
    const input = e.target as HTMLInputElement;
    input.focus();
  }
};

export default function BranchForm({ branch, onClose, onSubmit }) {
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: branch?.name || "",
      address: branch?.address || "",
      phoneNumber: branch?.phoneNumber || "",
      gstLicense: branch?.gstLicense || "",
      fssaiLicense: branch?.fssaiLicense || "",
      isOperational: branch?.isOperational ?? true,
      deliveryMethod: branch?.deliveryMethod || "",
      freeShippingLimit: branch?.freeShippingLimit || "",
      location: {
        coordinates: branch?.location?.coordinates
          ? branch.location.coordinates.map((coord) => String(coord))
          : ["", ""],
      },
      operationalHours: initializeOperationalHours(branch?.operationalHours),
      serviceableDistance: branch?.serviceableDistance || 8,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "operationalHours",
  });

  // Watch operationalHours to react to changes
  const operationalHoursWatch = watch("operationalHours");

  const handleFormSubmit = (data) => {
    const processedData = {
      ...data,
      isOperational: data.isOperational,
      freeShippingLimit: Number(data.freeShippingLimit),
      location: {
        type: "Point",
        coordinates: data.location.coordinates.map((coord) => Number(coord)),
      },
      operationalHours: data.operationalHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        isOpen: oh.isOpen,
        periods: oh.isOpen
          ? [
              {
                openingTime: oh.periods[0].openingTime,
                closingTime: oh.periods[0].closingTime,
              },
            ]
          : [],
      })),
    };
    onSubmit(processedData);
  };

  // Add blur handler for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      e.target.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ width: "100%" }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {branch ? "Edit Branch" : "Add Branch"}
        </Typography>

        <Grid container spacing={2}>
          {/* Left Section: General Details */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  {...register("name", { required: "Branch name is required" })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  onKeyDown={(e) => preventInvalidTab(e, !errors.name)}
                  onBlur={handleBlur}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  {...register("address", { required: "Address is required" })}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  onKeyDown={(e) => preventInvalidTab(e, !errors.address)}
                  onBlur={handleBlur}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  onKeyDown={(e) => preventInvalidTab(e, !errors.phoneNumber)}
                  onBlur={handleBlur}
                />
              </Grid>

              {/* GST License */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="GST License"
                  {...register("gstLicense", {
                    required: "GST License is required",
                  })}
                  error={!!errors.gstLicense}
                  helperText={errors.gstLicense?.message}
                />
              </Grid>

              {/* FSSAI License */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="FSSAI License"
                  {...register("fssaiLicense", {
                    required: "FSSAI License is required",
                  })}
                  error={!!errors.fssaiLicense}
                  helperText={errors.fssaiLicense?.message}
                />
              </Grid>

              {/* Delivery Method */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Method"
                  {...register("deliveryMethod", {
                    required: "Delivery Method is required",
                  })}
                  error={!!errors.deliveryMethod}
                  helperText={errors.deliveryMethod?.message}
                />
              </Grid>

              {/* Free Shipping Limit */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Free Shipping Limit"
                  type="number"
                  {...register("freeShippingLimit", {
                    required: "Free Shipping Limit is required",
                    min: {
                      value: 0,
                      message: "Must be a positive number",
                    },
                  })}
                  error={!!errors.freeShippingLimit}
                  helperText={errors.freeShippingLimit?.message}
                />
              </Grid>

              {/* Is Operational */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name="isOperational"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      )}
                    />
                  }
                  label="Is Operational"
                />
              </Grid>

              {/* Location Coordinates */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Location Coordinates
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      // type="number"
                      {...register("location.coordinates.0", {
                        required: "Longitude is required",
                      })}
                      error={!!errors.location?.coordinates?.[0]}
                      helperText={errors.location?.coordinates?.[0]?.message}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      // type="number"
                      {...register("location.coordinates.1", {
                        required: "Latitude is required",
                      })}
                      error={!!errors.location?.coordinates?.[1]}
                      helperText={errors.location?.coordinates?.[1]?.message}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Serviceable Distance (in km)"
                  {...register("serviceableDistance", {
                    required: "Serviceable Distance is required",
                  })}
                  error={!!errors.serviceableDistance}
                  helperText={errors.serviceableDistance?.message}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Section: Operational Hours */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Operational Hours
            </Typography>
            <Grid container spacing={2}>
              {fields.map((field, index) => (
                <Grid
                  container
                  item
                  xs={12}
                  key={field.id}
                  alignItems="center"
                  spacing={1}
                >
                  {/* Day of the Week */}
                  <Grid item xs={3}>
                    <Typography>{field.dayOfWeek}</Typography>
                  </Grid>

                  {/* Is Open Switch */}
                  <Grid item xs={2}>
                    <Controller
                      name={`operationalHours.${index}.isOpen`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Switch
                          {...controllerField}
                          checked={controllerField.value}
                          onChange={(e) => {
                            controllerField.onChange(e.target.checked);
                            if (!e.target.checked) {
                              setValue(
                                `operationalHours.${index}.periods.0.openingTime`,
                                "00:00"
                              );
                              setValue(
                                `operationalHours.${index}.periods.0.closingTime`,
                                "00:00"
                              );
                            } else {
                              // Optionally, reset to '00:00' or another default time
                              setValue(
                                `operationalHours.${index}.periods.0.openingTime`,
                                "00:00"
                              );
                              setValue(
                                `operationalHours.${index}.periods.0.closingTime`,
                                "00:00"
                              );
                            }
                          }}
                          color="primary"
                        />
                      )}
                    />
                  </Grid>

                  {/* Opening Time */}
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Opening Time"
                      type="time"
                      disabled={!operationalHoursWatch[index].isOpen}
                      {...register(
                        `operationalHours.${index}.periods.0.openingTime`,
                        {
                          required: operationalHoursWatch[index].isOpen
                            ? "Opening time is required"
                            : false,
                        }
                      )}
                      error={
                        !!errors.operationalHours?.[index]?.periods?.[0]
                          ?.openingTime
                      }
                      helperText={
                        errors.operationalHours?.[index]?.periods?.[0]
                          ?.openingTime?.message
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800, // 30 min
                      }}
                    />
                  </Grid>

                  {/* Closing Time */}
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Closing Time"
                      type="time"
                      disabled={!operationalHoursWatch[index].isOpen}
                      {...register(
                        `operationalHours.${index}.periods.0.closingTime`,
                        {
                          required: operationalHoursWatch[index].isOpen
                            ? "Closing time is required"
                            : false,
                        }
                      )}
                      error={
                        !!errors.operationalHours?.[index]?.periods?.[0]
                          ?.closingTime
                      }
                      helperText={
                        errors.operationalHours?.[index]?.periods?.[0]
                          ?.closingTime?.message
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800, // 30 min
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            {branch ? "Update Branch" : "Create Branch"}
          </Button>
        </Box>
      </Box>
    </form>
  );
}
