// src/lib/utils/dates.ts
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'

export const formatDate = (dateString: string, formatStr = 'd MMMM yyyy') => {
  try {
    return format(parseISO(dateString), formatStr, { locale: fr })
  } catch {
    return dateString
  }
}

export const formatDateShort = (dateString: string) => {
  return formatDate(dateString, 'd MMM yyyy')
}

export const formatDay = (dateString: string) => {
  return formatDate(dateString, 'd')
}

export const formatMonth = (dateString: string) => {
  return formatDate(dateString, 'MMM')
}

export const formatYear = (dateString: string) => {
  return formatDate(dateString, 'yyyy')
}

export const isUpcoming = (dateString: string) => {
  try {
    return isAfter(parseISO(dateString), new Date())
  } catch {
    return false
  }
}

export const isPast = (dateString: string) => {
  try {
    return isBefore(parseISO(dateString), new Date())
  } catch {
    return false
  }
}
