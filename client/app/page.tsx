import ChatComponent from './components/Chat';
import FileUploadComponent from './components/FileUpload';

export default function Home() {
  return (
    <main className='h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 md:flex'>
      <div className='md:w-[32%] lg:w-[30%] h-full p-4 md:p-6 border-b md:border-b-0 md:border-r border-zinc-800 flex justify-center items-start md:items-center bg-zinc-900/60'>
        <FileUploadComponent />
      </div>

      <div className='md:w-[68%] lg:w-[70%] h-full overflow-y-auto'>
        <ChatComponent />
      </div>
    </main>
  );
}
