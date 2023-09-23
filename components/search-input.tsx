"use client";

import qs from "query-string";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";


export const SearchInput = () => {
  
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryId = searchParams.get("getcategoryId");
    const name = searchParams.get("name");

    const [value, setValue] = useState(name || "");;
    const debouncedValue = useDebounce<string>(value, 500); //the value would only trigger the query to the DB after 0.5s of the keystroke end 
    
    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value)
    } //'value' state would be set to the input field's value

    useEffect(() => {
        const query = {
            name: debouncedValue,
            categoryId: categoryId,
        };

        const url = qs.stringifyUrl({
            url: window.location.href,
            query: query, //can also just write query here as key and value are both query
        }, { skipEmptyString: true, skipNull: true }); //removes empty strings or null values from the query for name and category ID

        router.push(url);
    }, [debouncedValue, router, categoryId])

    return (
        <div className='relative'>
            <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
            <Input 
                onChange={onChange}
                value={value}
                placeholder="Search" className="pl-10 bg-primary/10" />
        </div>
    )
}
