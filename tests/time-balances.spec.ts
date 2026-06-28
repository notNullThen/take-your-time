import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'take_your_time_data';
const FIXED_NOW_ISO = '2026-06-15T12:00:00.000Z';

type TestData = {
  records: Array<{ month: number; day: number; hours: number }>;
  settings: {
    standardHours: number;
    expirationMonths: number | 'endless';
    theme: 'auto' | 'dark' | 'light';
  };
};

const defaultData: TestData = {
  records: [],
  settings: {
    standardHours: 8,
    expirationMonths: 3,
    theme: 'light',
  },
};

async function openAppWithData(page: Page, data: TestData = defaultData) {
  await page.addInitScript(
    ({ fixedNowIso, storageKey, storageValue }) => {
      const RealDate = Date;
      const fixedTime = new RealDate(fixedNowIso).getTime();

      class FixedDate extends RealDate {
        constructor(...args: ConstructorParameters<DateConstructor>) {
          if (args.length === 0) {
            super(fixedTime);
            return;
          }

          super(...args);
        }

        static now() {
          return fixedTime;
        }
      }

      window.Date = FixedDate as DateConstructor;
      window.localStorage.setItem(storageKey, storageValue);
    },
    {
      fixedNowIso: FIXED_NOW_ISO,
      storageKey: STORAGE_KEY,
      storageValue: JSON.stringify(data),
    },
  );

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Take Your Time' })).toBeVisible();
}

test.describe('time balance UI calculations', () => {
  test('updates day, weekly, and summary balances when work time is entered', async ({ page }) => {
    await test.step('Open the app with an empty tracker in June 2026', async () => {
      await openAppWithData(page);
      await page.getByRole('button', { name: 'June' }).click();
    });

    await test.step('Enter 9 hours and 30 minutes for June 10', async () => {
      const row = page.getByRole('row').filter({ hasText: 'June 10' });

      await row.locator('.time-input-hours').fill('09');
      await row.locator('.time-input-minutes').fill('30');
    });

    await test.step('Verify the daily, weekly, and summary overwork balances', async () => {
      const row = page.getByRole('row').filter({ hasText: 'June 10' });

      await expect(row.getByText('+01:30')).toBeVisible();
      await expect(
        page.getByRole('row').filter({ hasText: 'Weekly Balance:' }).filter({ hasText: '+01:30' }).first(),
      ).toBeVisible();
      await expect(page.getByTestId('valid-overwork-balance')).toHaveText('+01:30');
      await expect(page.getByTestId('underwork-balance')).toHaveText('-00:00');
      await expect(page.getByTestId('total-net-balance')).toHaveText('+01:30');
    });
  });

  test('does not add overwork once a 3-month lifetime has elapsed', async ({ page }) => {
    await test.step('Open the app with one expired and one still-valid overwork record', async () => {
      await openAppWithData(page, {
        ...defaultData,
        records: [
          { month: 3, day: 5, hours: 10 },
          { month: 4, day: 5, hours: 9.5 },
        ],
      });
    });

    await test.step('Verify only the record newer than 3 months contributes overwork', async () => {
      await expect(page.getByTestId('valid-overwork-balance')).toHaveText('+01:30');
      await expect(page.getByTestId('underwork-balance')).toHaveText('-00:00');
      await expect(page.getByTestId('total-net-balance')).toHaveText('+01:30');
    });
  });

  test('keeps counting underwork after a 3-month lifetime has elapsed', async ({ page }) => {
    await test.step('Open the app with underwork older than 3 months', async () => {
      await openAppWithData(page, {
        ...defaultData,
        records: [{ month: 3, day: 6, hours: 6 }],
      });
    });

    await test.step('Verify old underwork still contributes to the total balance', async () => {
      await expect(page.getByTestId('valid-overwork-balance')).toHaveText('+00:00');
      await expect(page.getByTestId('underwork-balance')).toHaveText('-02:00');
      await expect(page.getByTestId('total-net-balance')).toHaveText('02:00');
      await expect(page.getByTestId('total-net-balance')).toHaveClass(/text-danger/);
    });
  });
});
