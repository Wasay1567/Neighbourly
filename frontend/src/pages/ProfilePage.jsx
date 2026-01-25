import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/features/userSlice'; // Used to update Redux state after save
import api from '../utils/api'; 
import toast from 'react-hot-toast';
import { User, Mail, FileText } from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  // We can get initial state from Redux, but we'll fetch fresh data to be safe
  const { userData } = useSelector((state) => state.user); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  // 1. Fetch Profile Data (GET /auth/me)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const user = data.data.user; // Backend: { success: true, data: { user: ... } }

        // Pre-fill form with backend data
        setValue('firstName', user.firstName || '');
        setValue('lastName', user.lastName || '');
        setValue('email', user.email);
        setValue('bio', user.bio || '');
        
        // Note: Your backend updateProfile controller currently only accepts 
        // firstName, lastName, bio, and avatarUrl. It does not handle 'location' yet.
        
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [setValue]);

  // 2. Handle Update (PATCH /auth/profile)
  const onSubmit = async (formData) => {
    try {
      const { data } = await api.patch('/auth/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio
      });

      // Update Redux State so Navbar updates immediately
      const updatedProfile = data.data.profile; // Backend returns the updated fields
      
      // Merge old userData with new updates
      const newUserData = { 
        ...userData, 
        ...updatedProfile,
        // Ensure the helper "NAME" property we use in UI is updated
        NAME: `${updatedProfile.firstName} ${updatedProfile.lastName}` 
      };
      
      dispatch(login({ userData: newUserData }));

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            isEditing 
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20"
          }`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Name Fields (Split) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <div className="relative">
                    <input
                        {...register('firstName', { required: "First name is required" })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition"
                    />
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
                {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <div className="relative">
                    <input
                        {...register('lastName', { required: "Last name is required" })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition"
                    />
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
            </div>
        </div>

        {/* Email (Read Only) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <input
                {...register('email')}
                disabled={true} 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed directly.</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About Me</label>
          <div className="relative">
            <textarea
                {...register('bio')}
                disabled={!isEditing}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition resize-none"
                placeholder="Tell your neighbors about yourself..."
            />
            <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 flex justify-end">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition transform active:scale-[0.98] disabled:opacity-70"
            >
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;