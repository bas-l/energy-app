import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css'
import { Button, FormControl, FormLabel, MenuItem, Select, TextField, duration } from '@mui/material';
import emotionStyled from '@emotion/styled';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCallback, useMemo, useState } from 'react';
import { format, parse, addDays, isSameDay, setHours, setMinutes, differenceInMinutes, isWeekend, addMinutes, min, max } from 'date-fns';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';

const Header = emotionStyled.header`
  background: yellow;
  display: flex;
  height: 100px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const LOW_COST_MINUTE = 0.18;
const HIGH_COST_MINUTE = 0.20;

const calculateDay = (startDate: Date, durationInMinutes: number, avgConsumptionPerMinute: number) => {
  const endDate = addMinutes(startDate, durationInMinutes);
  if (isWeekend(startDate)) {
    console.log('WEEKEND', durationInMinutes * LOW_COST_MINUTE * avgConsumptionPerMinute);
    return durationInMinutes * LOW_COST_MINUTE * avgConsumptionPerMinute;
  }

  const highCostStartTimeToday = parse('07:00:00', 'HH:mm:ss', startDate);
  const highCostEndTimeToday = parse('23:00:00', 'HH:mm:ss', startDate);
  const lowCostMinutesLeftSide = Math.min(Math.max(differenceInMinutes(highCostStartTimeToday, startDate), 0), durationInMinutes);
  const startTimeOfHighCost = max([startDate, highCostStartTimeToday]);
  const endTimeOfHighCost = min([endDate, highCostEndTimeToday]);
  const highCostMinutes = Math.max(differenceInMinutes(endTimeOfHighCost, startTimeOfHighCost), 0);
  const lowCostMinutesRightSide = Math.min(Math.max(differenceInMinutes(endDate,  highCostEndTimeToday), 0), durationInMinutes);
  console.log('WEEK', lowCostMinutesLeftSide, highCostMinutes, lowCostMinutesRightSide, avgConsumptionPerMinute);
  const costs = (lowCostMinutesLeftSide * LOW_COST_MINUTE + highCostMinutes * HIGH_COST_MINUTE + lowCostMinutesRightSide * LOW_COST_MINUTE) * avgConsumptionPerMinute;
  return costs
}

const durations: { value: number, format: string }[] = [];
for (let i = 0; i < 60 * 24; i += 15) {
  const hour = `${Math.floor(i / 60)}`.padStart(2, '0');
  const minute = `${i % 60}`.padStart(2, '0');
  durations.push({ value: i, format: hour + ':'+minute })
}

function App() {

  const [inputs, setInputs] = useState<{
    consumption: number; date: Date | null; textfield: string; time: Date | null; duration: number;
  }>({ date: new Date(), textfield: '', time: new Date(), duration: 0, consumption: 0 });
  const [costs, setCosts] = useState<number>();

  const changeNumber = useCallback((event: { target: { name: any; value: any; } | null; } | null) => {
    const name = event?.target?.name;
    const value = event?.target?.value;
    setInputs(values => ({ ...values, [name]: value !== null && value !== undefined ? parseInt(value) : value }))
  }, [setInputs]);


  const calculateCosts = useCallback(() => {
    console.log('CALCULATE COSTS', JSON.stringify(inputs))
    if (!inputs.date || !inputs.time || !inputs.duration || !inputs.consumption) {
      return setCosts(undefined);
    }
    let timeLeft = inputs.duration;
    let dayDate = new Date(`${inputs.date.toISOString().split('T')[0]}T${inputs.time.toISOString().split('T')[1]}`);
    const avgConsumptionPerMinute = inputs.consumption / inputs.duration;

    let totalCost = 0;
    while (timeLeft > 0) {
      const nextDay = addDays(parse('00:00:00', 'HH:mm:ss', dayDate), 1);
      const minutesLeftToday = Math.min(differenceInMinutes(nextDay, dayDate), timeLeft);
      totalCost += calculateDay(dayDate, minutesLeftToday, avgConsumptionPerMinute);
      timeLeft -= minutesLeftToday;
      dayDate = nextDay;
    }

    setCosts(totalCost);

  }, [setCosts, inputs.date, inputs.duration, inputs.consumption, inputs.time])

  return (
    <>

      <div>
        <Header role='heading'>Energy app</Header>
        <div style={{ display: 'grid', gridTemplateColumns: '100%' }}>
          <DatePicker data-testid='datepicker' label="Date" onChange={(e) => setInputs(values => ({ ...values, date: e }))} value={inputs.date}  />
          <TimePicker
           data-testid='timepicker'
            label="Time"
            onChange={(e) => setInputs(values => ({ ...values, time: e as Date }))}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            value={inputs.time}
            ampm={false}
            timeSteps={{ minutes: 1 }}
          />
          <TextField  inputProps={{['data-testid']:'consumption'}} type='number' name='consumption' label='Consumption' value={inputs?.consumption} onChange={changeNumber} />
          <TextField  inputProps={{['data-testid']:'duration'}} type='number' name='duration' label='Duration in minutes' value={inputs?.duration} onChange={changeNumber} />
         {/*  <FormControl>
            <Select id="demo-simple-select"
              value={inputs.duration}
              inputProps={{['data-testid']: 'duration'}}
              label="Duration"
              name="duration"
              onChange={changeNumber}>
              {durations.map(d => <MenuItem data-testid={d.value} key={d.value} value={d.value}>{d.format}</MenuItem>)}
            </Select>
          </FormControl> */}

          <Button onClick={calculateCosts} data-testid="calculate">Calculate</Button>
          <div data-testid='costs'>{costs ? costs?.toFixed(2) : '--'}  </div>
        </div>
      </div>

    </>
  )
}

export default App
