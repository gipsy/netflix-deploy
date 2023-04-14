import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useMovie = (id?: string | undefined) => {
  const { data, error, isLoading } = useSWR(id ? `/api/movies/${id}` : null, fetcher, {
    revalidateIfState: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  
  return {
    data,
    error,
    isLoading,
  }
}

export default useMovie;
