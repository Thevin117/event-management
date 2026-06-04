import BookingForm from '@/components/BookingForm'

export const metadata = { title: 'New Booking — EventBook' }

export default function BookingPage() {
  return (
    <main className="py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Book Our Services</h1>
        <p className="text-gray-500 mt-2">Fill in the details below and we&apos;ll confirm your booking shortly.</p>
      </div>
      <BookingForm />
    </main>
  )
}
