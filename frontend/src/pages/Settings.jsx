import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Briefcase, Link, AtSign, Save, ArrowLeft, Loader2, Info, Bell, Shield, Palette, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
  const { user, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    jobTitle: '',
    location: '',
    linkedin: '',
    twitter: '',
    avatar: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      jobTitle: user.jobTitle || '',
      location: user.location || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || '',
      avatar: user.avatar || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Compress the image before setting
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output as jpeg with quality 0.8 to keep size small
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData({ ...formData, avatar: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      await fetchProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate(`/user/${user?._id}`)}
              className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-2 group"
            >
              <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Profile
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your account settings and preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}
            >
              <User size={18} className={`mr-3 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`} />
              Public Profile
            </button>
            <button 
              className="w-full flex items-center p-3 rounded-xl text-sm font-bold text-gray-400 opacity-50 cursor-not-allowed"
            >
              <Shield size={18} className="mr-3 text-gray-300" />
              Account Security
            </button>
            <button 
              className="w-full flex items-center p-3 rounded-xl text-sm font-bold text-gray-400 opacity-50 cursor-not-allowed"
            >
              <Bell size={18} className="mr-3 text-gray-300" />
              Notifications
            </button>
            <button 
              className="w-full flex items-center p-3 rounded-xl text-sm font-bold text-gray-400 opacity-50 cursor-not-allowed"
            >
              <Palette size={18} className="mr-3 text-gray-300" />
              Appearance
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <motion.form 
                onSubmit={handleSubmit} 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                
                {/* Basic Info Card */}
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <User size={18} className="mr-2 text-indigo-500" /> Basic Information
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-8 mb-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-sm">
                          {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            (formData.name || 'A')[0].toUpperCase()
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wider">Profile Photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="pl-10 w-full bg-slate-100 border border-slate-200 text-gray-500 text-sm rounded-xl block p-3.5 cursor-not-allowed outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center font-medium">
                          <Info size={12} className="mr-1" /> Emails are tied to authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Professional Details Card */}
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Briefcase size={18} className="mr-2 text-indigo-500" /> Professional Details
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title / Role</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Briefcase size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            placeholder="e.g. Senior Product Manager"
                            className="pl-10 w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. San Francisco, CA"
                            className="pl-10 w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Bio</label>
                        <span className="text-xs font-semibold text-gray-400">{formData.bio.length}/300</span>
                      </div>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        maxLength="300"
                        placeholder="Tell us a little about yourself and your speaking goals..."
                        className="w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </motion.div>

                {/* Social Links Card */}
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Link size={18} className="mr-2 text-indigo-500" /> Social Presence
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Link size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className="pl-10 w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter (X) URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <AtSign size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/username"
                          className="pl-10 w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none hover:border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Save Button Footer */}
                <motion.div variants={itemVariants} className="flex justify-end pt-4 pb-12">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-soft flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" /> Save Profile
                      </>
                    )}
                  </button>
                </motion.div>
                
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
