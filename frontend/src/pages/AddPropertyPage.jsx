import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../api/client";
import {
  LAND_PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  FACING_DIRECTIONS,
  ZONING_TYPES
} from "../constants";
import { splitByComma } from "../utils";

const INITIAL_FORM = {
  title: "",
  description: "",
  propertyType: "Residential Plot",
  listingType: "Sale",
  price: "",
  area: "",
  city: "",
  state: "",
  country: "India",
  addressLine: "",
  pincode: "",
  latitude: "",
  longitude: "",
  plotSize: "",
  plotSizeUnit: "sqft",
  length: "",
  width: "",
  dimensionUnit: "ft",
  roadAccess: "true",
  facing: "East",
  zoningType: "Residential",
  water: "true",
  electricity: "true",
  sewage: "false",
  builtUpArea: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  amenities: "",
  images: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: ""
};

const toBoolean = (value) => value === "true";
const toNumber = (value) => (value === "" ? undefined : Number(value));

function AddPropertyPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isLandType = useMemo(
    () => LAND_PROPERTY_TYPES.includes(form.propertyType),
    [form.propertyType]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      if ((form.latitude && !form.longitude) || (!form.latitude && form.longitude)) {
        throw new Error("Provide both latitude and longitude together.");
      }

      const payload = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: Number(form.price),
        location: {
          addressLine: form.addressLine,
          area: form.area,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
          latitude: toNumber(form.latitude),
          longitude: toNumber(form.longitude)
        },
        ownerContact: {
          name: form.ownerName,
          phone: form.ownerPhone,
          email: form.ownerEmail
        },
        amenities: splitByComma(form.amenities),
        images: splitByComma(form.images)
      };

      if (isLandType) {
        payload.landDetails = {
          plotSize: Number(form.plotSize),
          plotSizeUnit: form.plotSizeUnit,
          dimensions: {
            length: toNumber(form.length),
            width: toNumber(form.width),
            unit: form.dimensionUnit
          },
          roadAccess: toBoolean(form.roadAccess),
          facing: form.facing,
          zoningType: form.zoningType,
          utilities: {
            water: toBoolean(form.water),
            electricity: toBoolean(form.electricity),
            sewage: toBoolean(form.sewage)
          }
        };
      } else {
        payload.builtUpArea = toNumber(form.builtUpArea);
        payload.bedrooms = toNumber(form.bedrooms);
        payload.bathrooms = toNumber(form.bathrooms);
        payload.parking = toNumber(form.parking);
      }

      const response = await createProperty(payload);

      setMessage("Property created successfully.");
      setForm(INITIAL_FORM);
      setTimeout(() => navigate(`/properties/${response.property._id}`), 500);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Could not create property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <section className="page-header compact">
        <p className="eyebrow">Create Listing</p>
        <h1>Add New Property / Plot</h1>
        <p>Use this form to add apartments, houses, residential plots, agricultural land, and commercial land.</p>
      </section>

      <form className="card-form" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <label>
            Title*
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Property Type*
            <select name="propertyType" value={form.propertyType} onChange={handleChange} required>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Listing Type*
            <select name="listingType" value={form.listingType} onChange={handleChange} required>
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Price (INR)*
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label className="full">
            Description*
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" required />
          </label>

          <label>
            Area / Locality*
            <input name="area" value={form.area} onChange={handleChange} required />
          </label>

          <label>
            City*
            <input name="city" value={form.city} onChange={handleChange} required />
          </label>

          <label>
            State*
            <input name="state" value={form.state} onChange={handleChange} required />
          </label>

          <label>
            Country*
            <input name="country" value={form.country} onChange={handleChange} required />
          </label>

          <label>
            Address Line
            <input name="addressLine" value={form.addressLine} onChange={handleChange} />
          </label>

          <label>
            Pincode
            <input name="pincode" value={form.pincode} onChange={handleChange} />
          </label>

          <label>
            Latitude
            <input name="latitude" type="number" step="0.000001" value={form.latitude} onChange={handleChange} />
          </label>

          <label>
            Longitude
            <input name="longitude" type="number" step="0.000001" value={form.longitude} onChange={handleChange} />
          </label>

          {isLandType ? (
            <>
              <label>
                Plot Size*
                <input name="plotSize" type="number" min="0" value={form.plotSize} onChange={handleChange} required={isLandType} />
              </label>

              <label>
                Plot Size Unit
                <select name="plotSizeUnit" value={form.plotSizeUnit} onChange={handleChange}>
                  <option value="sqft">sqft</option>
                  <option value="sqyd">sqyd</option>
                  <option value="acre">acre</option>
                  <option value="hectare">hectare</option>
                </select>
              </label>

              <label>
                Length
                <input name="length" type="number" min="0" value={form.length} onChange={handleChange} />
              </label>

              <label>
                Width
                <input name="width" type="number" min="0" value={form.width} onChange={handleChange} />
              </label>

              <label>
                Dimension Unit
                <select name="dimensionUnit" value={form.dimensionUnit} onChange={handleChange}>
                  <option value="ft">ft</option>
                  <option value="m">m</option>
                </select>
              </label>

              <label>
                Road Access
                <select name="roadAccess" value={form.roadAccess} onChange={handleChange}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label>
                Facing
                <select name="facing" value={form.facing} onChange={handleChange}>
                  {FACING_DIRECTIONS.map((facing) => (
                    <option key={facing} value={facing}>
                      {facing}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Zoning
                <select name="zoningType" value={form.zoningType} onChange={handleChange}>
                  {ZONING_TYPES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Water
                <select name="water" value={form.water} onChange={handleChange}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label>
                Electricity
                <select name="electricity" value={form.electricity} onChange={handleChange}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label>
                Sewage
                <select name="sewage" value={form.sewage} onChange={handleChange}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label>
                Built-up Area
                <input name="builtUpArea" type="number" min="0" value={form.builtUpArea} onChange={handleChange} />
              </label>

              <label>
                Bedrooms
                <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} />
              </label>

              <label>
                Bathrooms
                <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} />
              </label>

              <label>
                Parking Slots
                <input name="parking" type="number" min="0" value={form.parking} onChange={handleChange} />
              </label>
            </>
          )}

          <label className="full">
            Amenities (comma separated)
            <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Lift, CCTV, Gym" />
          </label>

          <label className="full">
            Image URLs (comma separated)
            <input
              name="images"
              value={form.images}
              onChange={handleChange}
              placeholder="https://..., https://..."
            />
          </label>

          <label>
            Sales Contact Name*
            <input name="ownerName" value={form.ownerName} onChange={handleChange} required />
          </label>

          <label>
            Sales Contact Phone*
            <input name="ownerPhone" value={form.ownerPhone} onChange={handleChange} required />
          </label>

          <label>
            Sales Contact Email
            <input name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Property"}
          </button>
        </div>

        {message ? <p className="status-text success">{message}</p> : null}
        {error ? <p className="status-text error">{error}</p> : null}
      </form>
    </div>
  );
}

export default AddPropertyPage;
