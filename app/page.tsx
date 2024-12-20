"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ReactSortable } from "react-sortablejs";
import { getAlbumInfo } from "./api/actions";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Moon, Sun } from "lucide-react";

export default function Home() {
    const { theme, setTheme } = useTheme();
    useEffect(() => {
        setTheme("light");
    }, []);

    function themeSwitch() {
        if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    }

    const [songs, setSongs] = useState<Song[]>([]);
    const [searchResult, setSearchResult] = useState<AlbumQuery | null>(null);
    const notFoundLabel = () => {
        if (searchResult != null && searchResult.result == null) {
            return (
                <div>
                    <p>Альбом не найден.</p>
                </div>
            );
        }
    };

    function generateSongsInfo() {
        const songsMessage = songs.map((s, i) => `${i + 1}. ${s.name}`);
        return `${searchResult?.result?.albumName}\n\n${songsMessage?.join("\n")}`;
    }

    async function copySongs() {
        await navigator.clipboard.writeText(generateSongsInfo());
    }

    function exportSongs() {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
            new Blob([generateSongsInfo()], { type: "text/plain" })
        );
        if (searchResult == null || searchResult.result == null) {
            throw new Error("Unreachable, for typescript");
        }
        link.download = searchResult?.result?.albumName;
        link.click();
    }

    const exportButtons = () => {
        if (songs.length !== 0) {
            return (
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-evenly space-x-4">
                        <Button onClick={copySongs} className="w-1/2 h-14">
                            Скопировать
                        </Button>
                        <Button onClick={exportSongs} className="w-1/2 h-14">
                            Сохранить в файл
                        </Button>
                    </div>
                    <h1 className="text-center text-2xl">
                        Для ранкинга необходимо перетаскивать треки на нужное
                        место.
                    </h1>
                </div>
            );
        }
    };

    const linkPlaceholder = () => {
        switch (searchForm.watch("source")) {
            case "discogs-master":
                return "https://www.discogs.com/master/1053720-Toby-Fox-Undertale-Soundtrack";
            case "discogs-release":
                return "https://www.discogs.com/release/21024259-My-Bloody-Valentine-Loveless";
            case "spotify":
                return "https://open.spotify.com/album/5IyHtkKQvafw7bQYFnx4FO";
        }
    };
    const searchSchema = z.object({
        source: z.enum(["discogs-master", "discogs-release", "spotify"]),
        link: z.string().url(),
    });

    const searchForm = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            source: "discogs-master",
            link: "",
        },
    });

    async function search(values: z.infer<typeof searchSchema>) {
        setSongs([]);
        const result = await getAlbumInfo(values.source, values.link);
        setSearchResult(result);
        if (result != null && result.result != null) {
            setSongs(result.result.songs);
        }
    }

    return (
        <>
            <div className="flex flex-col items-center p-2 space-y-4">
                <Toggle
                    variant="outline"
                    aria-label="Toggle theme"
                    onClick={themeSwitch}
                    className="w-full max-w-4xl h-12"
                >
                    {theme === "light" ? <Sun /> : <Moon />}
                </Toggle>
                <Form {...searchForm}>
                    <form
                        onSubmit={searchForm.handleSubmit(search)}
                        className="flex flex-col w-full max-w-4xl space-y-4"
                    >
                        <FormField
                            control={searchForm.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Откуда брать</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={String(field.value)}
                                            onValueChange={(value) => {
                                                searchForm.setValue("link", "");
                                                setSongs([]);
                                                setSearchResult(null);
                                                field.onChange(value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="discogs-master">
                                                    Discogs (master)
                                                </SelectItem>
                                                <SelectItem value="discogs-release">
                                                    Discogs (release)
                                                </SelectItem>
                                                <SelectItem value="spotify">
                                                    Spotify
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={searchForm.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ссылка на альбом</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={linkPlaceholder()}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="h-14">
                            Поиск
                        </Button>
                    </form>
                </Form>
                <div className="space-y-4 w-full max-w-4xl pt-8">
                    {exportButtons()}
                    <ReactSortable list={songs} setList={setSongs}>
                        {songs.map((s) => (
                            <div
                                key={s.id}
                                className="border-solid border-gray-300 border-4 border-b-0 last:border-b-4 h-12 cursor-grab"
                            >
                                {s.name}
                            </div>
                        ))}
                    </ReactSortable>
                    {notFoundLabel()}
                </div>
            </div>
        </>
    );
}
