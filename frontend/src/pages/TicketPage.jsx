import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Printer, Mail, ChevronLeft, Download, FileText } from 'lucide-react';
import { GSTInvoice } from '@/components/ui/invoice';
import { BookingTicket } from '@/components/ui/booking-ticket';
import html2pdf from 'html2pdf.js';

const TicketPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailing, setEmailing] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Get view from query param or default to 'ticket'
    const queryParams = new URLSearchParams(location.search);
    const initialView = queryParams.get('view') === 'invoice' ? 'invoice' : 'ticket';
    const [view, setView] = useState(initialView);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get('/bookings/my');
                if (Array.isArray(res.data)) {
                    const found = res.data.find(b => b.id?.toString() === bookingId?.toString());
                    if (found) {
                        setBooking(found);
                    } else {
                        navigate('/my-bookings');
                    }
                } else {
                    console.error("Expected array from /bookings/my but got:", res.data);
                    navigate('/my-bookings');
                }
            } catch (error) {
                console.error("Failed to fetch ticket", error);
                if (window.toast) window.toast("Error loading ticket", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setDownloading(true);
        try {
            const element = contentRef.current;
            const opt = {
                margin: 0,
                filename: view === 'ticket' ? `ZENDRUM_Ticket_${bookingId}.pdf` : `ZENDRUM_Invoice_${bookingId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // For the ticket specifically, we might want to center it a bit in the PDF
            // but opt.margin 0 and scale 2 usually works well for 600px width designs on A4
            await html2pdf().set(opt).from(element).save();
            if (window.toast) window.toast("Download started", "success");
        } catch (error) {
            console.error("PDF Download failed", error);
            if (window.toast) window.toast("Download failed", "error");
        } finally {
            setDownloading(false);
        }
    };

    const handleEmailTicket = async () => {
        setEmailing(true);
        try {
            await api.post(`/bookings/${bookingId}/email-ticket`);
            if (window.toast) window.toast("Booking confirmation sent to your email", "success");
        } catch (error) {
            if (window.toast) window.toast("Failed to send email", "error");
        } finally {
            setEmailing(false);
        }
    };

    if (loading || !booking) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    const event = booking.eventCategory?.event || {};
    const category = booking.eventCategory || {};
    const qty = booking.seatsBooked || 1;
    const convFee = qty > 0 ? (30.00 + Math.max(0, qty - 1) * 15.00) : 0;
    const gstAmount = Number((convFee * 0.18).toFixed(2));
    const subtotal = category.price * qty;
    const grandTotal = subtotal + convFee + gstAmount;

    // Prepare mapping for both Ticket and Invoice
    const bookingData = {
        invoiceNumber: `TIN${booking.id.toString().slice(0, 8).toUpperCase()}`,
        dateOfIssue: new Date(booking.bookingTime || Date.now()).toDateString(),
        placeOfSupply: 'Tamil Nadu',
        bookingId: booking.id.toString().toUpperCase(),
        customerGSTIN: '-',
        customerName: booking.user?.name || 'Guest',
        customerEmail: booking.user?.email || 'N/A',
        eventDetails: `${event.name} (${category.categoryName})`,
        eventName: event.name,
        eventDate: new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        eventTime: '06:00 PM', // Fallback or dynamic if available
        venueName: event.location || 'Main Arena',
        city: 'Chennai',
        categoryName: category.categoryName,
        seats: booking.seatIdentifiers || (booking.seatsBooked > 1 ? `Multiple (${booking.seatsBooked})` : 'Single Seat'),
        seatsBooked: booking.seatsBooked || 1,
        ticketPrice: category.price, // Unit Price
        ticketQty: booking.seatsBooked || 1, // Quantity
        ticketSubtotal: subtotal, // For BookingTicket display
        convenienceFee: convFee,
        gstAmount: gstAmount,
        totalAmount: grandTotal,
        bookingDateTime: new Date(booking.bookingTime || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        paymentMode: 'UPI',
        transactionId: booking.transactionId || `TXN${booking.id.toString().slice(0, 8).toUpperCase()}`,
        qrValue: `BOOKING-${booking.id}-${booking.transactionId || 'PENDING'}`
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-8 px-4 print:bg-white print:p-0">
            {/* Top Bar - Hidden on Print */}
            <div className="max-w-[210mm] mx-auto mb-4 flex flex-col md:flex-row justify-between items-center gap-6 print:hidden bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="flex bg-slate-200 p-1 rounded-lg">
                    <button
                        onClick={() => setView('ticket')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'ticket' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        TICKET VIEW
                    </button>
                    <button
                        onClick={() => setView('invoice')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'invoice' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        TAX INVOICE
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEmailTicket}
                        disabled={emailing}
                        className="h-9 px-4 border-slate-200"
                    >
                        <Mail className={`w-4 h-4 mr-2 ${emailing ? 'animate-pulse' : ''}`} />
                        Email
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="h-9 px-4 border-slate-200"
                    >
                        <Download className={`w-4 h-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                        Download PDF
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePrint}
                        className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex justify-center" ref={contentRef}>
                {view === 'ticket' ? (
                    <BookingTicket bookingData={bookingData} />
                ) : (
                    <GSTInvoice bookingData={bookingData} />
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    body { 
                        background: white; 
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact; 
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                }
            ` }} />
        </div>
    );
};

export default TicketPage;

