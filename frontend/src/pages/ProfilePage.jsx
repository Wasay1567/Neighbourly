import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api'; // Use the wrapper we made
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // 1. Fetch Profile Data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        // Pre-fill form
        setValue('name', data.NAME);
        setValue('email', data.EMAIL);
        setValue('bio', data.BIO || '');
        setValue('location', data.LOCATION || '');
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    loadProfile();
  }, [setValue]);

  // 2. Handle Update
  const onSubmit = async (formData) => {
    try {
      await api.put('/users/profile', formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 font-semibold hover:underline"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register('name', { required: "Name is required" })}
            disabled={!isEditing}
            className="mt-1 w-full p-3 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Email (Usually read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register('email')}
            disabled={true} // Email usually shouldn't be changed easily
            className="mt-1 w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            {...register('bio')}
            disabled={!isEditing}
            rows={4}
            className="mt-1 w-full p-3 border rounded-lg disabled:bg-gray-50"
            placeholder="Tell your neighbors about yourself..."
          />
        </div>

        {/* Location (Visual Only for now) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            {...register('location')}
            disabled={!isEditing}
            className="mt-1 w-full p-3 border rounded-lg disabled:bg-gray-50"
            placeholder="e.g. Downtown, Karachi"
          />
        </div>

        {isEditing && (
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;