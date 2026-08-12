'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/mockData';

export default function ProfilePage() {
  const { wishlist, orders, addToCart, toggleWishlist } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'payments' | 'wishlist' | 'settings'>('orders');

  // Mock User Info
  const user = {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    memberSince: 'January 2024',
    tier: 'VIP Gold Member',
  };

  // Mock Addresses
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      type: 'Home (Default)',
      name: 'Alex Morgan',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      isDefault: true,
    },
    {
      id: 'addr-2',
      type: 'Office',
      name: 'Alex Morgan',
      street: '100 Innovation Way, Suite 400',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      isDefault: false,
    }
  ]);

  // Mock Payment Cards
  const [cards] = useState([
    {
      id: 'card-1',
      brand: 'Visa',
      last4: '4242',
      expiry: '08/28',
      holder: 'ALEX MORGAN',
      isDefault: true,
    },
    {
      id: 'card-2',
      brand: 'Mastercard',
      last4: '8819',
      expiry: '11/27',
      holder: 'ALEX MORGAN',
      isDefault: false,
    }
  ]);

  // Wishlist products
  const wishedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 space-y-8 text-black">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="font-integral text-2xl sm:text-3xl font-black uppercase text-black">
            MY ACCOUNT
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your profile, order history, shipping addresses, and account settings.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0F0F0] rounded-full text-xs font-bold text-black hover:bg-gray-200 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: User Avatar & Info */}
        <div className="md:col-span-8 flex items-center gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-black shrink-0">
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-integral text-xl sm:text-2xl font-black text-black">
                {user.name}
              </h2>
              <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {user.tier}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              {user.email} &bull; {user.phone}
            </p>

            <p className="text-[11px] text-gray-400">
              Member since {user.memberSince}
            </p>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="md:col-span-4 grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <span className="font-integral text-xl sm:text-2xl font-black text-black block">
              {orders.length}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Orders</span>
          </div>

          <div>
            <span className="font-integral text-xl sm:text-2xl font-black text-black block">
              {wishlist.length}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Wishlist</span>
          </div>

          <div>
            <span className="font-integral text-xl sm:text-2xl font-black text-black block">
              {addresses.length}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Addresses</span>
          </div>
        </div>

      </div>

      {/* Main Layout: Tabs Navigation + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Navigation (4 Cols) */}
        <aside className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-3 sm:p-4 space-y-1 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'addresses' ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'payments' ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Payment Methods</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'wishlist' ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlist.length})</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'settings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/"
              onClick={() => alert('Logged Out')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </Link>
          </div>
        </aside>

        {/* Right Content Area (8 Cols) */}
        <main className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-integral text-xl font-black uppercase text-black">
                Order History
              </h2>

              {orders.length === 0 ? (
                <div className="bg-[#F0F0F0] rounded-3xl p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-gray-600 text-sm font-medium">You haven't placed any orders yet.</p>
                  <Link href="/shop" className="inline-block px-6 py-2.5 bg-black text-white font-bold text-xs rounded-full">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                      {/* Order Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 text-xs">
                        <div>
                          <span className="font-extrabold text-black text-sm block">
                            {order.id}
                          </span>
                          <span className="text-gray-400">Placed on {order.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${order.statusColor}`}>
                            {order.status}
                          </span>
                          <span className="font-extrabold text-black text-sm">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-[#F0EEED] rounded-xl overflow-hidden relative shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-black line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-400">
                                Size: {item.size} &bull; Color: {item.color} &bull; Qty: {item.quantity}
                              </p>
                              <span className="font-bold text-xs text-black">
                                ${item.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions Bar */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500 font-medium">
                          Tracking: <strong className="text-black">{order.trackingNum}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Tracking information for ${order.trackingNum}`)}
                            className="px-4 py-2 bg-[#F0F0F0] rounded-full font-bold text-black hover:bg-gray-200 transition-colors"
                          >
                            Track Package
                          </button>
                          <Link
                            href="/shop"
                            className="px-4 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                          >
                            Buy Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-integral text-xl font-black uppercase text-black">
                  Saved Addresses
                </h2>
                <button
                  onClick={() => alert('Add New Address Modal')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-gray-200 rounded-3xl p-5 space-y-3 shadow-sm relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-black">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-green-100 text-green-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-black block">{addr.name}</strong>
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => alert(`Edit address ${addr.id}`)}
                        className="font-bold text-black hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-integral text-xl font-black uppercase text-black">
                  Payment Methods
                </h2>
                <button
                  onClick={() => alert('Add Payment Card Modal')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-black text-white rounded-3xl p-6 space-y-4 shadow-md relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-integral text-lg font-black tracking-widest">
                        {card.brand}
                      </span>
                      {card.isDefault && (
                        <span className="bg-white/20 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-lg tracking-widest pt-2">
                      •••• •••• •••• {card.last4}
                    </p>

                    <div className="flex justify-between items-end text-xs text-gray-300">
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase">Cardholder</span>
                        <span className="font-bold text-white">{card.holder}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase">Expires</span>
                        <span className="font-bold text-white">{card.expiry}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-integral text-xl font-black uppercase text-black">
                My Saved Wishlist ({wishedProducts.length})
              </h2>

              {wishedProducts.length === 0 ? (
                <div className="bg-[#F0F0F0] rounded-3xl p-12 text-center space-y-4">
                  <Heart className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-gray-600 text-sm font-medium">Your wishlist is currently empty.</p>
                  <Link
                    href="/shop"
                    className="inline-block px-6 py-3 bg-black text-white font-bold text-xs rounded-full"
                  >
                    Browse Clothes
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-gray-200 rounded-3xl p-4 space-y-3 relative group"
                    >
                      <div className="relative aspect-square bg-[#F0EEED] rounded-2xl overflow-hidden">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-red-500 shadow-md hover:scale-110 transition-transform"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-black line-clamp-1">
                          {prod.title}
                        </h4>
                        <span className="font-extrabold text-sm text-black block mt-1">
                          ${prod.price}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        className="w-full py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-all"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="font-integral text-xl font-black uppercase text-black border-b border-gray-200 pb-4">
                Account Settings & Security
              </h2>

              <form onSubmit={(e) => { e.preventDefault(); alert('Settings Saved!'); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs font-semibold text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue={user.phone}
                      className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs font-semibold text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full bg-[#F0F0F0] rounded-full px-4 py-3 text-xs font-semibold text-black focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h3 className="font-bold text-sm text-black uppercase">
                    Notification Preferences
                  </h3>

                  <label className="flex items-center gap-3 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" defaultChecked className="accent-black rounded" />
                    <span>Receive SMS delivery status updates</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" defaultChecked className="accent-black rounded" />
                    <span>Receive promotional emails and special discount codes</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-all shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
