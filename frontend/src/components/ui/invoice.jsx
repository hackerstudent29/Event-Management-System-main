import React from 'react';

// Refined Handwritten style ZB Logo Component
export const ZendrumLogo = ({ size = 40, className = "", weight = 4 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Handwritten Z - smooth stroke */}
        <path
            d="M 25 35 C 45 32, 65 32, 75 35 L 35 70 C 55 68, 75 68, 85 70"
            stroke="currentColor"
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Handwritten B - slightly tilted, connected loops */}
        <path
            d="M 45 30 L 45 75 M 45 35 C 65 35, 75 45, 45 50 C 75 52, 85 70, 45 75"
            stroke="currentColor"
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        {/* Decorative underline */}
        <path
            d="M 20 85 Q 50 80, 80 85"
            stroke="currentColor"
            strokeWidth={weight / 2}
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
        />
    </svg>
);

// Number to Words Helper (Indian Standard)
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if (n < 20) return a[n];
        let s = b[Math.floor(n / 10)];
        if (n % 10 > 0) s += ' ' + a[n % 10];
        return s;
    };

    const convert = (n) => {
        if (n === 0) return 'Zero';
        let str = '';
        if (n >= 100000) {
            str += inWords(Math.floor(n / 100000)) + 'Lakh ';
            n %= 100000;
        }
        if (n >= 1000) {
            str += inWords(Math.floor(n / 1000)) + 'Thousand ';
            n %= 1000;
        }
        if (n >= 100) {
            str += inWords(Math.floor(n / 100)) + 'Hundred ';
            n %= 100;
        }
        if (n > 0) {
            if (str !== '') str += 'and ';
            str += inWords(n);
        }
        return str;
    };

    const whole = Math.floor(num);
    const fraction = Math.round((num - whole) * 100);

    let res = convert(whole) + 'Rupee(s) ';
    if (fraction > 0) {
        res += 'And ' + inWords(fraction) + 'Paisa ';
    }
    return res + 'Only.';
};

// Company Info updated per user request
export const COMPANY_INFO = {
    name: 'ZENDRUMBOOKING',
    gstin: '33AABPZ0605A1Z5', // TN + DOB
    pan: 'AABPZ0605A',
    stateCode: '33',
    fullAddress: 'Gr. Floor, Plot No. 42, Velachery Main Road, Velachery, Chennai, Tamil Nadu, 600042.',
};

export const GSTInvoice = ({ bookingData = {} }) => {
    const {
        invoiceNumber = 'TIN' + Date.now(),
        dateOfIssue = new Date().toDateString(),
        placeOfSupply = 'Tamil Nadu',
        bookingId = 'ZB' + Math.random().toString(36).substring(7).toUpperCase(),
        customerGSTIN = '-',
        customerName = 'Guest User',
        customerEmail = 'user@example.com',
        eventDetails = 'Event Name (Hall/Screen Details)',
        ticketPrice = 0,
        ticketQty = 0,
        convenienceFee = 0,
        gstAmount = 0,
        grandTotal = 0,
        transactionId = '4728470867',
        paymentMode = 'UPI',
        paymentDateTime = new Date().toLocaleString(),
    } = bookingData;

    const sacCode = '999799';
    const ticketSAC = '999691'; // Cultural services/Admission
    const totalTicketAmount = Number(ticketPrice || 0) * Number(ticketQty || 0);

    // Safety check for pricing props to prevent crashes
    const safeGst = Number(gstAmount || 0);
    const safeConv = Number(convenienceFee || 0);

    const totalIGST = Number(safeGst.toFixed(2));
    const totalConvPart = Number((safeConv + totalIGST).toFixed(2));
    const grandTotalPaid = Number((totalTicketAmount + totalConvPart).toFixed(2));

    const words = numberToWords(grandTotalPaid);

    return (
        <div className="bg-white mx-auto print:shadow-none shadow-sm" style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '15mm',
            fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
            color: '#333',
            position: 'relative'
        }}>
            {/* HEADER SECTION */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-2xl font-normal text-gray-800 mb-4">Invoice</h1>
                    <div className="grid grid-cols-[110px_1fr] gap-y-1 text-[10px] text-gray-600">
                        <span>Invoice Number</span><span>: {invoiceNumber}</span>
                        <span>Date of issue</span><span>: {dateOfIssue}</span>
                        <span>Place of supply</span><span>: {placeOfSupply}</span>
                        <span>Booking ID</span><span>: {bookingId}</span>
                        <span>Customer GSTIN</span><span>: {customerGSTIN}</span>
                        <span>State Code</span><span>: {COMPANY_INFO.stateCode}</span>
                        <span>Customer Name</span><span>: {customerName}</span>
                        <span>Customer Email</span><span>: {customerEmail}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex justify-end gap-1.5 items-center mb-4">
                        <ZendrumLogo size={45} className="text-gray-900" />
                        <div className="text-left leading-none tracking-tight uppercase" style={{ fontFamily: 'Righteous, sans-serif', fontSize: '18px' }}>
                            ZENDRUM<br />BOOKING
                        </div>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-y-1 text-[10px] text-gray-600 text-left ml-auto" style={{ width: '240px' }}>
                        <span>Invoice issued by</span><span className="font-bold">: ZENDRUMBOOKING Pvt Ltd</span>
                        <span>GSTIN</span><span>: {COMPANY_INFO.gstin}</span>
                        <span>PAN</span><span className="uppercase">: {COMPANY_INFO.pan}</span>
                        <span>State code</span><span>: {COMPANY_INFO.stateCode}</span>
                        <span>Company Address</span><span className="leading-relaxed">: {COMPANY_INFO.fullAddress}</span>
                    </div>
                </div>
            </div>

            {/* TABLE SECTION */}
            <table className="w-full border-collapse border border-gray-300 text-[9px] mb-6">
                <thead>
                    <tr className="bg-gray-50 text-gray-600">
                        <th className="border border-gray-300 px-2 py-3 font-medium text-left">Product Description</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-center">SAC Code</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-center">Qty</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-right">Price</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-right">Discount</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-right">Taxable Amount</th>
                        <th colSpan="2" className="border border-gray-300 font-medium text-center">CGST</th>
                        <th colSpan="2" className="border border-gray-300 font-medium text-center">SGST</th>
                        <th colSpan="2" className="border border-gray-300 font-medium text-center">IGST</th>
                        <th colSpan="2" className="border border-gray-300 font-medium text-center">UT/Cess</th>
                        <th className="border border-gray-300 px-2 py-3 font-medium text-right">Total</th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-500 text-[8px]">
                        <th colSpan="6"></th>
                        <th className="border border-gray-300 border-t-0 p-1 text-center font-normal">Rate</th><th className="border border-gray-300 border-t-0 p-1 text-right font-normal">Amount</th>
                        <th className="border border-gray-300 border-t-0 p-1 text-center font-normal">Rate</th><th className="border border-gray-300 border-t-0 p-1 text-right font-normal">Amount</th>
                        <th className="border border-gray-300 border-t-0 p-1 text-center font-normal">Rate</th><th className="border border-gray-300 border-t-0 p-1 text-right font-normal">Amount</th>
                        <th className="border border-gray-300 border-t-0 p-1 text-center font-normal">Rate</th><th className="border border-gray-300 border-t-0 p-1 text-right font-normal">Amount</th>
                        <th className="border border-gray-300 border-t-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {/* Row 1: Ticket Admission */}
                    <tr>
                        <td className="border border-gray-300 px-2 py-4 align-top w-[180px] leading-normal uppercase">
                            Admission to {eventDetails}
                        </td>
                        <td className="border border-gray-300 text-center">{ticketSAC}</td>
                        <td className="border border-gray-300 text-center">{ticketQty}</td>
                        <td className="border border-gray-300 text-right px-2">{ticketPrice.toFixed(2)}</td>
                        <td className="border border-gray-300 text-right px-2">0</td>
                        <td className="border border-gray-300 text-right px-2">{totalTicketAmount.toFixed(2)}</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-center">0%</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-right px-2 font-medium">{totalTicketAmount.toFixed(2)}</td>
                    </tr>
                    {/* Row 2: Convenience Fees */}
                    <tr>
                        <td className="border border-gray-300 px-2 py-4 align-top w-[180px] leading-normal uppercase">
                            Convenience fee/ internet handling fee/ delivery fee for {eventDetails}
                        </td>
                        <td className="border border-gray-300 text-center">{sacCode}</td>
                        <td className="border border-gray-300 text-center">1</td>
                        <td className="border border-gray-300 text-right px-2">{convenienceFee.toFixed(2)}</td>
                        <td className="border border-gray-300 text-right px-2">0</td>
                        <td className="border border-gray-300 text-right px-2">{convenienceFee.toFixed(2)}</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-center">VARIES</td><td className="border border-gray-300 text-right px-2">{totalIGST.toFixed(2)}</td>
                        <td className="border border-gray-300 text-center">0</td><td className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-right px-2 font-medium">{totalConvPart.toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold bg-white text-gray-800">
                        <td className="border border-gray-300 px-2 py-1">Total</td>
                        <td className="border border-gray-300"></td>
                        <td className="border border-gray-300 text-center">{ticketQty + 1}</td>
                        <td className="border border-gray-300 text-right px-2"></td>
                        <td className="border border-gray-300 text-right px-2">0</td>
                        <td className="border border-gray-300 text-right px-2">{(totalTicketAmount + convenienceFee).toFixed(2)}</td>
                        <td colSpan="2" className="border border-gray-300 text-right px-2">0.00</td>
                        <td colSpan="2" className="border border-gray-300 text-right px-2">0.00</td>
                        <td colSpan="2" className="border border-gray-300 text-right px-2">{totalIGST.toFixed(2)}</td>
                        <td colSpan="2" className="border border-gray-300 text-right px-2">0.00</td>
                        <td className="border border-gray-300 text-right px-2">{grandTotalPaid.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            {/* SUMMARY SECTION */}
            <div className="flex flex-col items-end mb-8 space-y-1 text-[10px]">
                <div className="grid grid-cols-[160px_80px] gap-x-2 text-gray-600">
                    <span className="text-right">Total Amount before Tax :</span><span className="text-right">{(totalTicketAmount + safeConv).toFixed(2)}</span>
                    <span className="text-right">Add. CGST :</span><span className="text-right">0.00</span>
                    <span className="text-right">Add. SGST :</span><span className="text-right">0.00</span>
                    <span className="text-right">Add. IGST :</span><span className="text-right">{totalIGST.toFixed(2)}</span>
                    <span className="text-right">Add. UGST or Cess :</span><span className="text-right">0.00</span>
                </div>
                <div className="grid grid-cols-[160px_80px] gap-x-2 border-t border-gray-300 pt-1 font-bold">
                    <span className="text-right uppercase">Total Amount : GST :</span><span className="text-right">{totalIGST.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-[160px_80px] gap-x-2 pt-1 font-bold text-[13px] border-b border-gray-300 pb-1 mt-1">
                    <span className="text-right">Total Amount after Tax :</span><span className="text-right text-black">{grandTotalPaid.toFixed(2)}</span>
                </div>
                <div className="text-[9px] text-gray-600 font-normal tracking-tight mt-1 self-end italic">
                    {words}
                </div>
            </div>

            {/* FOOTER SECTION */}
            <div className="grid grid-cols-2 gap-10 text-[9px] text-gray-600">
                <div>
                    <p className="mb-1"><span className="font-bold">Note:</span></p>
                    <p className="mb-4 text-justify leading-relaxed">
                        Value of Rs.{(ticketPrice * ticketQty).toFixed(2)}/- pertains to services provided by Theatre/Event Organizer/
                        Cinema Owner {eventDetails}.
                    </p>
                    <p className="mb-4 text-gray-800 font-bold uppercase">RCM: No</p>
                    <p className="font-bold border-b border-gray-400 inline-block mb-1">Payment Reference</p>
                    <ul className="list-disc ml-4 space-y-0.5">
                        <li>Transaction Id & Amount of Payment: {transactionId}, Rs. {grandTotalPaid.toFixed(2)}/-</li>
                        <li>Date & Time: {paymentDateTime}</li>
                        <li>Mode of payment : {paymentMode}</li>
                    </ul>
                </div>
                <div className="text-left pt-2">
                    <p className="mb-4">Certified that the particulars given above are true and correct</p>
                    <p className="font-bold mb-4">For ZENDRUMBOOKING Pvt. Ltd.</p>

                    <div className="relative mt-12">
                        <div className="absolute -top-12 left-0 pointer-events-none transform -rotate-12 opacity-80">
                            <ZendrumLogo size={75} className="text-black" weight={1.2} />
                        </div>
                        <div className="border-t border-gray-300 w-44 pt-1 text-gray-500 font-bold uppercase text-[8px] tracking-widest">
                            Authorised signatory
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GSTInvoice;
