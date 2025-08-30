export default function Loading() {
  return (
    <>
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
        <div className="border-4 border-solid border-cyan-500 rounded-full animate-spin dark:border-cyan-500 h-16 w-16">
          <div className="bg-black rounded-full h-full w-16"></div>
        </div>
        <p className=" animate-pulse capitalize font-medium text-2xl font-serif text-cyan-500">
          Loading...
        </p>
      </div>
    </>
  );
}
