import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import App from "./App"
import { act, fireEvent, getByTestId, render, waitFor } from '@testing-library/react'
import { DEFAULT_LOCALE, LocalizationProvider } from "@mui/x-date-pickers";
import nl from 'date-fns/locale/nl';
import userEvent from '@testing-library/user-event'

describe('App', () => {
    test('render correctly', () => {
        const { getByRole } = render(

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
                <App />
            </LocalizationProvider>

        )

        const titleElement = getByRole('heading')
        expect(titleElement).toBeInTheDocument()
    })

    test.each([
        ['20-12-2023', '00:00', 60, 1, '0.18'], // week
        ['23-12-2023', '07:00', 60, 1, '0.18'], // weekend
        ['20-12-2023', '07:00', 60, 1, '0.20'], // week high cost
        ['20-12-2023', '00:00', 24*60, 24*1, '4.64'], // whole day
        ['20-12-2023', '23:45', 30, 1, '0.18'], // half hour
        ['20-12-2023', '23:45', 30, 0, '--'], // No consumption
        ['20-12-2023', '23:45', 0, 1, '--'] // No duration
    ])(`The cost for date %s with time %s and duration %i and consumption %i will be %s`, async (date: string, time: string, duration: number, consumption: number, expectedCost: string) => {
        const user = userEvent.setup()
        const { getByTestId, getByLabelText } = render(

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
                <App />
            </LocalizationProvider>

        )

        const calendar = getByLabelText('Date')
        await user.type(calendar, date);

        const timeInput = getByLabelText('Time');
        await user.type(timeInput, time);

        const d = getByTestId('duration');
        // fireEvent.click(d);
        // const menuItem = getByTestId('10:00')
        // fireEvent.click(menuItem);
        await user.type(d, duration + '');




        const consumptionInput = getByTestId('consumption');


        await user.type(consumptionInput, consumption + '');
        await act(() => user.click(getByTestId('calculate')));

        expect(getByTestId('costs')).toHaveTextContent(`${expectedCost}`);
    })
});