import React from 'react';
import { ZendrumLogo } from './invoice';
import { QRCodeSVG } from 'qrcode.react';

export const BookingTicket = ({ bookingData = {} }) => {
    const {
        bookingId = 'WFBHGFL',
        eventName = 'Event Name',
        eventImage = '', // Fallback image logic below
        eventDate = 'Fri, 15 Aug 2025',
        eventTime = '12:35 PM',
        venueName = 'AGS Cinemas OMR (Screen 1)',
        city = 'Chennai',
        categoryName = 'PREMIUM',
        seats = 'M9',
        seatsBooked = 1,
        ticketPrice = 183.00, // Unit price fallback
        ticketSubtotal = 183.00, // Mapping from TicketPage
        convenienceFee = 30.00,
        gstAmount = 5.40,
        totalAmount = 218.40,
        bookingDateTime = 'Sat, 9 Aug 2025 | 07:39 am',
        paymentMode = 'UPI',
        transactionId = '2591719',
        qrValue = 'WFBHGFL-2591719'
    } = bookingData;

    // Fallback images based on event type/name if none provided
    const fallbackImage = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=600&h=300";

    return (
        <div className="bg-white mx-auto shadow-2xl overflow-hidden" style={{
            maxWidth: '600px',
            color: '#333',
            border: '1px solid #eee'
        }}>
            {/* Header */}
            <div className="pt-8 pb-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <ZendrumLogo size={40} className="text-pink-600" />
                    <span className="text-2xl tracking-tight text-slate-900" style={{ fontFamily: 'Righteous, sans-serif' }}>ZENDRUMBOOKING</span>
                </div>
                <h2 className="text-green-600 font-bold text-xl mb-1">Your booking is confirmed!</h2>
                <p className="text-gray-500 text-sm">Booking ID: <span className="font-bold text-slate-800">{bookingId}</span></p>
            </div>

            {/* Event Image */}
            <div className="px-6">
                <div className="relative aspect-[2/1] w-full rounded-xl overflow-hidden shadow-md">
                    <img
                        src={eventImage || fallbackImage}
                        alt={eventName}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Event Details */}
            <div className="px-8 mt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{eventName}</h3>
                        <p className="text-slate-700 font-medium">{eventTime} | {eventDate}</p>
                        <p className="text-slate-500 text-sm">{venueName}</p>
                        <p className="text-slate-500 text-sm">{city}</p>
                    </div>
                    {/* Status Stamp */}
                    <div className="border-4 border-dashed border-green-600/30 rounded-xl p-2 rotate-12 flex flex-col items-center justify-center">
                        <span className="text-green-600 font-black text-[10px] leading-tight">BOOKING</span>
                        <span className="text-green-600 font-black text-[10px] leading-tight">CONFIRMED</span>
                    </div>
                </div>

                {/* Seat Details */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category & Seats</span>
                        <p className="font-bold text-slate-800">{categoryName} - {seats || seatsBooked + ' Ticket(s)'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Arena/Screen</span>
                        <p className="font-bold text-slate-800">{venueName.includes('(Screen') ? venueName.split('(')[1].replace(')', '') : 'Main Hall'}</p>
                    </div>
                </div>

                {/* Primary Action (Hidden on Print if needed, but here as per prompt) */}
                <div className="mt-8 text-center print:hidden">
                    <button className="bg-pink-600 text-white font-bold py-3 px-12 rounded-full shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all">
                        Open Ticket
                    </button>
                    <p className="text-[10px] text-slate-400 mt-4 px-10">Check your booking details, discounts, deals and much more with your ticket</p>
                </div>
            </div>

            {/* Spacer with Perforation Look */}
            <div className="mt-8 relative h-4 bg-slate-50 border-y border-dashed border-slate-200">
                <div className="absolute -left-3 -top-2 w-6 h-8 bg-white rounded-full"></div>
                <div className="absolute -right-3 -top-2 w-6 h-8 bg-white rounded-full"></div>
            </div>

            {/* Order Summary Section */}
            <div className="bg-slate-50 p-8 pt-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Order Summary</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-700">TICKET AMOUNT</p>
                            <p className="text-[10px] text-slate-400">Quantity: {seatsBooked} ticket(s)</p>
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(ticketSubtotal)}
                        </p>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-700">CONVENIENCE FEES</p>
                            <p className="text-[10px] text-slate-400">Base: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(convenienceFee)} | GST: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(gstAmount)}</p>
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(convenienceFee + gstAmount)}
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <p className="text-base font-black text-slate-900">AMOUNT PAID</p>
                        <p className="text-lg font-black text-slate-900">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalAmount)}
                        </p>
                    </div>
                </div>

                {/* Payment Info Table-like */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t border-slate-200 pt-6">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking Date</p>
                        <p className="text-[10px] font-bold text-slate-700 leading-tight">{bookingDateTime.split('|')[0]}</p>
                        <p className="text-[10px] text-slate-400">{bookingDateTime.split('|')[1]}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Type</p>
                        <p className="text-[10px] font-bold text-slate-700">{paymentMode}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmation#</p>
                        <p className="text-[10px] font-bold text-slate-700">{transactionId}</p>
                    </div>
                </div>

                {/* QR Code */}
                <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <QRCodeSVG value={qrValue} size={150} level="H" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Show this QR code at entry</p>
                </div>

                {/* Important Notes */}
                <div className="mt-8 bg-white/50 p-4 rounded-xl border border-slate-200/50">
                    <p className="text-[10px] font-bold text-slate-900 mb-2 uppercase tracking-tight">Important Instructions</p>
                    <ul className="text-[9px] text-slate-500 space-y-1 list-disc ml-3">
                        <li>Entry via digital QR code only. Keep the screen brightness high.</li>
                        <li>Carry a valid government ID.</li>
                        <li>This ticket is non-transferable and non-refundable.</li>
                        <li>Enjoy your event at {venueName}!</li>
                    </ul>
                </div>

                {/* Signature Section */}
                <div className="mt-10 border-t border-slate-200 pt-8 flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 mb-6">Authorized by,</p>
                        <div className="relative">
                            <div className="absolute -top-12 left-0 transform -rotate-12 opacity-80 pointer-events-none">
                                <ZendrumLogo size={70} className="text-pink-600/60" weight={1.2} />
                            </div>
                            <div className="w-40 border-t border-slate-200 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pb-4 text-center">
                    <p className="text-[10px] text-slate-400 mb-4">Need help? Contact us at support@zendrumbooking.com</p>
                    <div className="flex justify-center gap-4 grayscale opacity-50">
                        {/* Placeholder for social icons */}
                        <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                        <div className="w-6 h-6 bg-slate-400 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
