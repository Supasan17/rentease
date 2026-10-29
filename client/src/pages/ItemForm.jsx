/**
 * Item Form Page
 *
 * Create and edit form for item listings, used by owners and admins.
 * /items/new creates an item with POST /api/items, and /items/:id/edit
 * loads the item and saves it with PUT /api/items/:id. The form is sent
 * as multipart/form-data so up to 5 images (jpg, jpeg, png or webp, 5 MB
 * each) can be uploaded with it. When editing, new images replace the
 * current ones; leaving the picker empty keeps them.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES, CONDITIONS, getImageUrl } from '../utils/items.js';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  pricePerDay: '',
  deposit: '',
  city: '',
  address: '',
  condition: 'good',
  isAvailable: true,
};

const validateForm = (form) => {
  const errors = {};
  if (!form.title.trim()) {
    errors.title = 'Please provide a title';
  } else if (form.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }
  if (!form.description.trim()) {
    errors.description = 'Please provide a description';
  } else if (form.description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }
  if (!form.category) {
    errors.category = 'Please choose a category';
  }
  if (form.pricePerDay === '') {
    errors.pricePerDay = 'Please provide a price per day';
  } else if (Number.isNaN(Number(form.pricePerDay)) || Number(form.pricePerDay) < 0) {
    errors.pricePerDay = 'Price per day must be a non-negative number';
  }
  if (form.deposit !== '' && (Number.isNaN(Number(form.deposit)) || Number(form.deposit) < 0)) {
    errors.deposit = 'Deposit must be a non-negative number';
  }
  if (!form.city.trim()) {
    errors.city = 'Please provide a city';
  }
  return errors;
};

const validateImages = (files) => {
  if (files.length > MAX_IMAGES) {
    return `You can upload up to ${MAX_IMAGES} images`;
  }
  if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
    return 'Only jpg, jpeg, png and webp images are allowed';
  }
  if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
    return 'Each image must be 5 MB or smaller';
  }
  return '';
};

/**
 * Build the multipart body. Nested location fields use bracket names,
 * which multer turns back into req.body.location.
 */
const toFormData = (form, images) => {
  const data = new FormData();
  data.append('title', form.title.trim());
  data.append('description', form.description.trim());
  data.append('category', form.category);
  data.append('pricePerDay', form.pricePerDay);
  data.append('deposit', form.deposit === '' ? '0' : form.deposit);
  data.append('location[city]', form.city.trim());
  data.append('location[address]', form.address.trim());
  data.append('condition', form.condition);
  data.append('isAvailable', String(form.isAvailable));
  images.forEach((file) => data.append('images', file));
  return data;
};

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

/**
 * Label, control and error message for one form field.
 */
function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ItemForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When editing, load the item and fill in the form
  useEffect(() => {
    if (!isEdit) return undefined;
    let ignore = false;

    const fetchItem = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await api.get(`/items/${id}`);
        if (ignore) return;
        const { item } = data;

        if (user.role !== 'admin' && item.owner?._id !== user._id) {
          setLoadError('You can only edit your own items.');
          return;
        }

        setForm({
          title: item.title || '',
          description: item.description || '',
          category: item.category || '',
          pricePerDay: String(item.pricePerDay ?? ''),
          deposit: String(item.deposit ?? ''),
          city: item.location?.city || '',
          address: item.location?.address || '',
          condition: item.condition || 'good',
          isAvailable: item.isAvailable ?? true,
        });
        setCurrentImages(item.images || []);
      } catch (error) {
        if (!ignore) setLoadError(getErrorMessage(error));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchItem();
    return () => {
      ignore = true;
    };
  }, [id, isEdit, user]);

  // Free the preview object URLs when they change or the page unmounts
  useEffect(
    () => () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    },
    [previews]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const imageError = validateImages(files);
    setErrors((prev) => ({ ...prev, images: imageError || undefined }));

    if (imageError) {
      e.target.value = '';
      setImages([]);
      setPreviews([]);
      return;
    }

    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const formErrors = validateForm(form);
    const imageError = validateImages(images);
    if (imageError) formErrors.images = imageError;
    setErrors(formErrors);
    if (Object.keys(formErrors).length) return;

    setSubmitting(true);
    try {
      const body = toFormData(form, images);
      const { data } = isEdit ? await api.put(`/items/${id}`, body) : await api.post('/items', body);
      navigate(`/items/${data.item._id}`);
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-gray-600">Loading item...</p>;
  }

  if (loadError) {
    return (
      <section className="py-12 text-center">
        <h1 className="text-2xl font-bold">Cannot edit this item</h1>
        <p className="mt-2 text-gray-600">{loadError}</p>
        <Link to="/" className="mt-6 inline-block font-medium text-emerald-600 hover:underline">
          Back to browsing
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit item' : 'List a new item'}</h1>
      <p className="mt-2 text-gray-600">
        {isEdit ? 'Update the details of your listing.' : 'Tell renters about the item you want to rent out.'}
      </p>

      {serverError && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5 rounded-lg border border-gray-200 bg-white p-6">
        <Field id="title" label="Title" error={errors.title}>
          <input id="title" name="title" type="text" className={inputClass} value={form.title} onChange={handleChange} />
        </Field>

        <Field id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            name="description"
            rows={5}
            className={inputClass}
            value={form.description}
            onChange={handleChange}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="category" label="Category" error={errors.category}>
            <select id="category" name="category" className={inputClass} value={form.category} onChange={handleChange}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          <Field id="condition" label="Condition" error={errors.condition}>
            <select id="condition" name="condition" className={inputClass} value={form.condition} onChange={handleChange}>
              {CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="pricePerDay" label="Price per day (Rs.)" error={errors.pricePerDay}>
            <input
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              min="0"
              step="any"
              className={inputClass}
              value={form.pricePerDay}
              onChange={handleChange}
            />
          </Field>

          <Field id="deposit" label="Deposit (Rs.)" error={errors.deposit}>
            <input
              id="deposit"
              name="deposit"
              type="number"
              min="0"
              step="any"
              placeholder="0"
              className={inputClass}
              value={form.deposit}
              onChange={handleChange}
            />
          </Field>

          <Field id="city" label="City" error={errors.city}>
            <input id="city" name="city" type="text" className={inputClass} value={form.city} onChange={handleChange} />
          </Field>

          <Field id="address" label="Address (optional)" error={errors.address}>
            <input
              id="address"
              name="address"
              type="text"
              className={inputClass}
              value={form.address}
              onChange={handleChange}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Available to rent
        </label>

        <Field id="images" label="Images" error={errors.images}>
          <input
            id="images"
            name="images"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Up to {MAX_IMAGES} images, jpg, png or webp, 5 MB each.
            {isEdit && currentImages.length > 0 && ' New images replace the current ones.'}
          </p>
        </Field>

        {(previews.length > 0 || currentImages.length > 0) && (
          <div>
            <p className="text-sm font-medium text-gray-700">{previews.length > 0 ? 'New images' : 'Current images'}</p>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(previews.length > 0 ? previews : currentImages.map(getImageUrl)).map((src) => (
                <img key={src} src={src} alt="" className="aspect-square w-full rounded-md object-cover" />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create listing'}
          </button>
          <Link
            to={isEdit ? `/items/${id}` : '/'}
            className="rounded-md px-4 py-2 font-medium text-gray-700 hover:text-emerald-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export default ItemForm;
