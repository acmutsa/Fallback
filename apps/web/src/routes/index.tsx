import { createFileRoute } from '@tanstack/react-router'
import {APP_NAME} from "shared/constants"
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/functions/api';

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  console.log("App rendered");
  console.log(import.meta.env);
  return (
    <div>
      <h1 className="text-4xl font-bold">Welcome to {APP_NAME}!</h1>
      <p className="mt-4">
        This is a simple app using <code>create-tsrouter-app</code>.
      </p>
      <Button className="mt-4" onClick={async () => {
        toast.loading("Talking to server...");
        const res = await fetchData();
        toast.dismiss();
        if (res.ok){
          toast.success((await res.json()).status);
        }
      }
      }>Ping server</Button>
    </div>
  )
}


async function fetchData(){
  return apiClient.health.$get();

}