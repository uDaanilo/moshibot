import { addHours, getHours, getMinutes, getSeconds } from "date-fns"

export default function formatDuration(sec) {
  const normalizeTime = (time: string): string => time.length === 1 ? `0${time}` : time

  const SECONDS_TO_MILLISECONDS_COEFF = 1000
  const MINUTES_IN_HOUR = 60

  const milliseconds = sec * SECONDS_TO_MILLISECONDS_COEFF

  const date = new Date(milliseconds)
  const timezoneDiff = date.getTimezoneOffset() / MINUTES_IN_HOUR
  const dateWithoutTimezoneDiff = addHours(date, timezoneDiff)

  const hours = normalizeTime(String(getHours(dateWithoutTimezoneDiff)))
  const minutes = normalizeTime(String(getMinutes(dateWithoutTimezoneDiff)))
  const seconds = normalizeTime(String(getSeconds(dateWithoutTimezoneDiff)))

  const hoursOutput = hours !== '00' ? `${hours}:` : ''

  return `${hoursOutput}${minutes}:${seconds}`
}