import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { previousBidderEmail, laptopModel, newBidAmount } = await request.json();

    if (!previousBidderEmail) {
      return NextResponse.json({ message: "No previous bidder to email." });
    }

    const data = await resend.emails.send({
      from: 'Company Auction <onboarding@resend.dev>',
      to: previousBidderEmail,
      subject: `Action Required: You've been outbid on the ${laptopModel}!`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #d97706;">You've been outbid!</h2>
          <p>Hello,</p>
          <p>Someone just placed a higher bid on the <strong>${laptopModel}</strong> you were watching.</p>
          <p>The new highest bid is now <strong>₱${newBidAmount.toLocaleString()}</strong>.</p>
          <p>If you still want this item, you will need to place a new bid!</p>
          <br/>
          <p><em>- Voly</em></p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}