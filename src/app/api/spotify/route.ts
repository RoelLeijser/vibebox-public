import puppeteer from "puppeteer";
import type { Page } from "puppeteer";
import { z } from "zod";

export async function POST(request: Request) {
  const userInputSchema = z.object({
    name: z.string().min(1).max(64),
    email: z.string().email(),
  });

  try {
    const { name, email } = await userInputSchema.parseAsync(
      await request.json(),
    );
    await AddUser(name, email);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: error.issues,
        }),
        { status: 400 },
      );
    } else if (
      error instanceof Error &&
      error.message === "Email already exists"
    ) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 },
      );
    }

    return new Response(
      JSON.stringify({
        error,
      }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({
      message: "User added",
    }),
    { status: 200 },
  );
}

async function AddUser(name: string, email: string) {
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  await page.goto("https://accounts.spotify.com/en/login");
  await page.click("#login-button");
  await page.waitForNavigation({});

  await page.goto(
    "https://developer.spotify.com/dashboard/19358060e2244bdfb8d405fd0ec6399c/users",
  );

  if (await emailExists(email, page)) {
    await browser.close();

    throw new Error("Email already exists");
  }

  if (await listIsFull(page)) {
    await removeFirstEntry(page);
  }

  await page.waitForSelector("#name");

  await page.type("#name", name);
  await page.type("#email", email);
  await page.keyboard.press("Enter");

  await browser.close();
}

async function emailExists(email: string, page: Page) {
  await page.waitForSelector("table tr:not(.hoXXxN)");

  const emailArray = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tr:not(.hoXXxN)");

    return Array.from(rows).map((row) => {
      const cells = row.getElementsByTagName("td");
      const emailCell = cells[2];

      return emailCell?.textContent?.trim() ?? "";
    });
  });

  return emailArray.includes(email);
}

async function listIsFull(page: Page) {
  await page.waitForSelector("table tbody");

  return await page.evaluate(() => {
    const table = document.querySelector("table");
    return !!table && table.getElementsByTagName("tr").length === 25;
  });
}

async function removeFirstEntry(page: Page) {
  console.log("Removing first entry");

  await page.waitForSelector('button[aria-label="User options"]');

  console.log("Found user options");

  await page.click('button[aria-label="User options"]');

  console.log("Clicked user options");

  // await page.waitForSelector('button[data-encore-id="popoverNavigationLink"]');

  // console.log("Found popover navigation link");

  await page.click('button[data-encore-id="popoverNavigationLink"]');

  console.log("Clicked popover navigation link");
}
