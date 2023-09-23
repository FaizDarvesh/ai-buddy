"use client";

import * as z from "zod"; // installed from the shadcn ui form
import { Category, Companion } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wand2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface CompanionFormProps {
    initialData: Companion | null,
    categories: Category[];
}

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    description: z.string().min(1, {
        message: "Description is required",
    }),
    instructions: z.string().min(100, {
        message: "Instructions are required, with at least a 100 characters",
    }),
    seed: z.string().min(100, {
        message: "Seed is required, with at least a 100 characters",
    }),
    src: z.string().min(1, {
        message: "An image is required for the buddy",
    }),
    categoryId: z.string().min(1, {
        message: "Category is required",
    }),
})

// Constant declaration
const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;


export const CompanionForm = ({initialData, categories}: CompanionFormProps) => {
    
    const router = useRouter();
    const { toast } = useToast(); //to display error / success message on API call
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), //Zod and its Resolver are used for schema declaration and type validation
        defaultValues: initialData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        }
    });

    const isLoading = form.formState.isSubmitting; //Check if form has been submitted and if not show loader

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // passing form as a parameter and defining type
        try {
            // Check if initial data present in which case update buddy and not create a new record
            if(initialData) {
                await axios.patch(`/api/companion/${initialData.id}`, values); //Initial data is of type Companion as defined above and its Prisma Schema has id
            } else {
                await axios.post("/api/companion", values);
            }

            toast({
                description:"Success",
            })

            router.refresh(); //Immediately refresh data from the DB to load the record just edited
            router.push("/"); //Push to the home page
            
        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong",
            });
        }


        console.log(values);
    }
    
    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
            {/* To pass in all the props to the Form component from shadcn spread the parts of the form using approach above */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground">General information about your AI buddy</p>
                        </div>
                        <Separator className="bg-primary/10"/>

                    </div>
                    <FormField 
                        name="src"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center space-y-4">
                                <FormControl>
                                    <ImageUpload 
                                        disabled={isLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="name"
                            control={ form.control }
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Elon Musk" {...field}/>
                                        {/* Manually pass all other fields by destructuring fields parameter that is passed into render */}
                                    </FormControl>
                                    <FormDescription>
                                        Your AI buddy will be named this.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description" //Name has to be something in the formcontrol schema defined above
                            control={ form.control }
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="CEO of SpaceX and Tesla" {...field}/>
                                        {/* Manually pass all other fields by destructuring fields parameter that is passed into render */}
                                    </FormControl>
                                    <FormDescription>
                                        A short description of your AI buddy.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="categoryId" //Name has to be something in the formcontrol schema defined above
                            control={ form.control }
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Category</FormLabel>
                                    <Select 
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue 
                                                    defaultValue={field.value}
                                                    placeholder="Select a category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                    {/* category information is passed as props from the page.tsx for companion route where it is queried from DB into this component */}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a category for your AI buddy.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-3 w-full">
                        <div>
                            <h3 className="text-lg font-medium">Configuration</h3>
                            <p className="text-sm text-muted-foreground">Detailed instructions for how the AI buddy should behave</p>
                        </div>
                        <Separator className="bg-primary/10"/>
                    </div>
                    <FormField
                        name="instructions"
                        control={ form.control }
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        className="bg-background" 
                                        rows={7} 
                                        disabled={isLoading} 
                                        placeholder={PREAMBLE} 
                                        {...field}
                                    />
                                    {/* Manually pass all other fields by destructuring fields parameter that is passed into render */}
                                </FormControl>
                                <FormDescription>
                                    Share instructions for the AI buddy and relevant details for the prompt.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="seed"
                        control={ form.control }
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Sample conversation</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        className="bg-background" 
                                        rows={7} 
                                        disabled={isLoading} 
                                        placeholder={SEED_CHAT} 
                                        {...field}
                                    />
                                    {/* Manually pass all other fields by destructuring fields parameter that is passed into render */}
                                </FormControl>
                                <FormDescription>
                                    A sample conversation between the user and this AI buddy.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initialData ? "Save changes" : "Setup your AI buddy"}
                            <Wand2 className="w-4 h-4 ml-2"/>
                        </Button>
                    </div>
                </form>

            </Form>
        </div>
    )
}