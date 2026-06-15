export default function HomePage() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Welcome to InfoStore</h1>
      <p className='text-gray-600 mb-6'>
        A database of documented examples of harmful societal actions, with coherent arguments and source links.
      </p>
      <div className='flex gap-4'>
        <a href='/dashboard' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          View Entries
        </a>
      </div>
    </div>
  )
}
