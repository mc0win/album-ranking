"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { findRankings, rankingExists, upsertRankings } from "./api/database";
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
import { useToast } from "@/hooks/use-toast";
import { SunMoon } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    function themeSwitch() {
        if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    }

    const nicknames = [
        { label: "astigm4tism", value: "astigm4tism" },
        { label: "Autiat", value: "Autiat" },
        { label: "Aze122333", value: "Aze122333" },
        { label: "borddelasolitude_exe", value: "borddelasolitude_exe" },
        { label: "HeNCaF_hm", value: "HeNCaF_hm" },
        { label: "Hindeko", value: "Hindeko" },
        { label: "horriblemuck", value: "horriblemuck" },
        { label: "Ilushatopch", value: "Ilushatopch" },
        { label: "joosenitsa", value: "joosenitsa" },
        { label: "mcowin", value: "mcowin" },
        { label: "mihaps", value: "mihaps" },
        { label: "morph", value: "morph" },
        { label: "MotokEkb", value: "MotokEkb" },
        { label: "noblefoul", value: "noblefoul" },
        { label: "oddjar", value: "oddjar" },
        { label: "oquafr", value: "oquafr" },
        { label: "retsaya", value: "retsaya" },
        { label: "sailinthesea", value: "sailinthesea" },
        { label: "ShioriWatanabe", value: "ShioriWatanabe" },
        { label: "smileb0y52", value: "smileb0y52" },
        { label: "snowyowo", value: "snowyowo" },
        { label: "takma123", value: "takma123" },
        { label: "tehtactiq", value: "tehtactiq" },
        { label: "truelyalyaa", value: "truelyalyaa" },
        { label: "UncleNessid", value: "UncleNessid" },
        { label: "water667", value: "water667" },
    ] as const;

    const [songs, setSongs] = useState<Song[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [albumsReady, setAlbumsReady] = useState(false);
    const [searchResult, setSearchResult] = useState<AlbumQuery | null>(null);
    const [chosenNickname, setChosenNickname] = useState("");
    const [chosenNicknameCopy, setChosenNicknameCopy] = useState("");
    const [allRankings, setAllRankings] = useState(
        new Map<string, Map<string, number>>()
    );

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
        toast({
            title: "Скопировано в буфер обмена!",
        });
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-14">
                                Выбрать никнейм
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Никнеймы</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                                value={chosenNickname}
                                onValueChange={setChosenNickname}
                            >
                                <ScrollArea className="h-[200px]">
                                    {nicknames.map((nickname, i) => (
                                        <DropdownMenuRadioItem
                                            key={i}
                                            value={nickname.value}
                                        >
                                            {nickname.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </ScrollArea>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={send}
                        className="h-14"
                    >
                        Отправить на сервер
                    </Button>
                    <div className="flex justify-evenly space-x-4">
                        <Button
                            variant="outline"
                            onClick={copySongs}
                            className="w-1/2 h-14"
                        >
                            Скопировать
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportSongs}
                            className="w-1/2 h-14"
                        >
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

    async function get() {
        if (chosenNicknameCopy !== "") {
            setAllRankings(await findRankings(chosenNicknameCopy));
            if (allRankings.size !== 0) {
                setAlbumsReady(true);
            } else {
                toast({
                    title: "У этого человека нет ранкингов.",
                });
            }
        }
    }

    const albumRankings = () => {
        if (albumsReady && allRankings.size !== 0) {
            return (
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full pt-4"
                >
                    <CarouselContent>
                        {Array.from(allRankings.values()).map((value, i) => (
                            <CarouselItem key={i} className="">
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="space-y-4 w-full max-w-4xl pt-8">
                                            <ScrollArea className="h-[400px]">
                                                <div className="flex flex-col items-left pl-4">
                                                    {Array.from(
                                                        value.keys()
                                                    ).map((song, i) => (
                                                        <div
                                                            key={i}
                                                            className="h-12 flex"
                                                        >
                                                            <div className="border-r border-accent-foreground w-12 h-12 flex items-center justify-center text-xl">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex items-center pl-4">
                                                                {song}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
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
        link: z.string().url("Неверная ссылка."),
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

    const sendSchema = z.object({
        nickname: z.string().nonempty("Пожалуйста, введите никнейм."),
    });

    const sendForm = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: {
            nickname: "",
        },
    });

    async function update() {
        await upsertRankings(
            sendForm.getValues().nickname,
            searchResult?.result?.albumName,
            songs.map((s) => `${s.name}`)
        );
        toast({
            title: "Ранкинг успешно обновлён!",
        });
    }

    async function reset() {
        setAlbumsReady(false);
    }

    async function send() {
        if (chosenNickname !== "") {
            if (
                !(await rankingExists(
                    chosenNickname,
                    searchResult?.result?.albumName
                ))
            ) {
                await upsertRankings(
                    chosenNickname,
                    searchResult?.result?.albumName,
                    songs.map((s) => `${s.name}`)
                );
                toast({
                    title: "Ранкинг успешно отправлен на сервер!",
                });
            } else {
                setOpenDialog(true);
            }
        }
    }

    return (
        <>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Хотите обновить ранкинг?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" onClick={update}>
                                Да
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Нет
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex justify-evenly space-x-4">
                <Tabs
                    defaultValue="ranking"
                    className="space-y-4 w-full max-w-4xl p-4"
                    onValueChange={reset}
                >
                    <TabsList className="relative w-full">
                        <TabsTrigger value="ranking" className="w-1/3">
                            Оценка альбома
                        </TabsTrigger>
                        <TabsTrigger value="results" className="w-1/3">
                            Ранкинги
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="w-1/3">
                            Видео
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ranking">
                        <div className="flex flex-col items-center p-2 space-y-4">
                            <Toggle
                                variant="outline"
                                aria-label="Toggle theme"
                                onClick={themeSwitch}
                                className="w-full max-w-4xl h-12"
                            >
                                <SunMoon />
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
                                                <FormLabel>
                                                    Откуда брать
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        value={String(
                                                            field.value
                                                        )}
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            searchForm.setValue(
                                                                "link",
                                                                ""
                                                            );
                                                            setSongs([]);
                                                            setSearchResult(
                                                                null
                                                            );
                                                            field.onChange(
                                                                value
                                                            );
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
                                                                Discogs
                                                                (release)
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
                                                <FormLabel>
                                                    Ссылка на альбом
                                                </FormLabel>
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
                                    <Button
                                        variant="outline"
                                        type="submit"
                                        className="h-14"
                                    >
                                        Поиск
                                    </Button>
                                </form>
                            </Form>
                            <div className="space-y-4 w-full max-w-4xl">
                                {exportButtons()}
                                {songs.length > 0 ? (
                                    <div>
                                        <ReactSortable
                                            list={songs}
                                            setList={setSongs}
                                            className="border border-accent-foreground rounded-lg"
                                        >
                                            {songs.map((s, i) => (
                                                <div
                                                    key={s.id}
                                                    className="cursor-grab [&:not(:last-child)]:border-b border-accent-foreground h-12 flex"
                                                >
                                                    <div className="border-r border-accent-foreground w-12 h-12 flex items-center justify-center text-xl">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex items-center pl-4">
                                                        {s.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </ReactSortable>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                {notFoundLabel()}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="results">
                        <div className="pb-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full max-w-4xl h-12"
                                    >
                                        Выбрать никнейм
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>
                                        Никнеймы
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup
                                        value={chosenNicknameCopy}
                                        onValueChange={setChosenNicknameCopy}
                                    >
                                        <ScrollArea className="h-[200px]">
                                            {nicknames.map((nickname, i) => (
                                                <DropdownMenuRadioItem
                                                    key={i}
                                                    value={nickname.value}
                                                >
                                                    {nickname.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </ScrollArea>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Button
                            type="button"
                            onClick={get}
                            className="w-full max-w-4xl h-12"
                            variant="outline"
                        >
                            Посмотреть ранкинги
                        </Button>
                        {albumRankings()}
                    </TabsContent>
                    <TabsContent value="videos"></TabsContent>
                </Tabs>
            </div>
        </>
    );
}
