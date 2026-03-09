import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { type, emails, laptopModel, newBidAmount } = await request.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({ message: "No recipients." });
    }

    if (type === "outbid") {
      const results = await Promise.allSettled(
        emails.map((email: string) =>
          resend.emails.send({
            from: 'Company Auction <onboarding@resend.dev>',
            to: email,
            subject: `Action Required: The bid amount on ${laptopModel} was raised!`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h2 style="color: #d97706;">You've been outbid!</h2>
                <p>Hello,</p>
                <p>An admin has updated the current bid on the <strong>${laptopModel}</strong> you placed a bid on.</p>
                <p>The new minimum bid is now <strong>₱${Number(newBidAmount).toLocaleString()}</strong>.</p>
                <p>If you still want this item, you will need to place a higher bid!</p>
                <br/>
                <p><em>- Voly</em></p>
              </div>
            `,
          })
        )
      );
      return NextResponse.json({ success: true, results });
    }

    if (type === "cancellation") {
      const results = await Promise.allSettled(
        emails.map((email: string) =>
          resend.emails.send({
            from: 'Company Auction <onboarding@resend.dev>',
            to: email,
            subject: `Listing Removed: ${laptopModel} is no longer available`,
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h2 style="color: #ef4444;">Bid Cancelled</h2>
                <p>Hello,</p>
                <p>We wanted to let you know that the listing for <strong>${laptopModel}</strong> has been removed from the auction by an admin. Your bid on this item has been cancelled.</p>
                <p>But don't worry — there are still great items available! We encourage you to check out the other listings and place a bid on something you like.</p>
                <br/>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse Available Assets</a>
                <br/><br/>
                <p><em>- Voly</em></p>
              </div>
            `,
          })
        )
      );
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: "Unknown email type." }, { status: 400 });
  } catch (error) {
    console.error("Admin Email Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
