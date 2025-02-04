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
import {
    checkRankings,
    findAlbums,
    findAllAlbums,
    findRanking,
    findSongs,
    findTotalRankings,
    rankingExists,
    upsertRankings,
} from "./api/database";
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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validatePassword } from "@/app/api/accounts";
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
        { label: "MotokEkb", value: "MotokEkb" },
        { label: "noblefoul", value: "noblefoul" },
        { label: "oddjar", value: "oddjar" },
        { label: "oquafr", value: "oquafr" },
        { label: "pentachloronitrobenzene", value: "pentachloronitrobenzene" },
        { label: "retsaya", value: "retsaya" },
        { label: "sailinthesea", value: "sailinthesea" },
        { label: "ShioriWatanabe", value: "ShioriWatanabe" },
        { label: "smileb0y52", value: "smileb0y52" },
        { label: "snowy", value: "snowy" },
        { label: "takma123", value: "takma123" },
        { label: "tehtactiq", value: "tehtactiq" },
        { label: "truelyalyaa", value: "truelyalyaa" },
        { label: "water667", value: "water667" },
    ] as const;

    const [songs, setSongs] = useState<Song[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [albumSelection, setAlbumSelection] = useState(true);
    const [songSelection, setSongSelection] = useState(true);
    const [anotherAlbumSelection, setAnotherAlbumSelection] = useState(true);
    const [searchResult, setSearchResult] = useState<AlbumQuery | null>(null);
    const [chosenAlbum, setChosenAlbum] = useState<string[]>([]);
    const [allAlbums, setAllAlbums] = useState<string[]>([]);
    const [totalRankings, setTotalRankings] = useState(
        new Map<string, Map<string, number>>()
    );
    const [allUserAlbums, setAllUserAlbums] = useState<string[]>([]);
    const [allSongs, setAllSongs] = useState<string[]>([]);
    const [chosenAlbumName, setChosenAlbumName] = useState("");
    const [chosenSong, setChosenSong] = useState("");
    const [anotherChosenAlbumName, setAnotherChosenAlbumName] = useState("");
    const [chosenNickname, setChosenNickname] = useState("");

    const notFoundLabel = () => {
        if (searchResult != null && searchResult.result == null) {
            return <div>Альбом не найден.</div>;
        }
    };

    const exportButtons = () => {
        if (songs.length !== 0) {
            return (
                <Form {...sendForm}>
                    <form
                        onSubmit={sendForm.handleSubmit(send)}
                        className="flex flex-col w-full max-w-4xl space-y-4"
                    >
                        <FormField
                            control={sendForm.control}
                            name="nickname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Никнейм</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={String(field.value)}
                                            onValueChange={(value) => {
                                                sendForm.setValue(
                                                    "nickname",
                                                    "password"
                                                );
                                                field.onChange(value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {nicknames.map(
                                                    (nickname, i) => (
                                                        <SelectItem
                                                            key={i}
                                                            value={
                                                                nickname.value
                                                            }
                                                        >
                                                            {nickname.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={sendForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Пинкод</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            maxLength={4}
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
                            Отправить на сервер
                        </Button>
                    </form>
                </Form>
            );
        }
    };

    const albumRankings = () => {
        if (chosenNickname !== "" && chosenAlbum.length > 0) {
            return (
                <div>
                    <Card>
                        <CardContent className="space-y-4 w-full max-w-4xl pt-8 h-[600px]">
                            <ScrollArea className="h-[470px]">
                                <div className="border border-accent-foreground rounded-lg">
                                    {chosenAlbum.map((song, i) => (
                                        <div
                                            key={i}
                                            className="[&:not(:last-child)]:border-b border-accent-foreground h-12 flex"
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
                        </CardContent>
                    </Card>
                </div>
            );
        }
    };
    const totalAlbumRankings = () => {
        if (
            anotherChosenAlbumName != "" &&
            totalRankings.size > 0 &&
            chosenSong != ""
        ) {
            let i = Array.from(totalRankings.keys()).indexOf(chosenSong);
            let value = Array.from(totalRankings.values())[i];
            return (
                <div className="p-1">
                    <Card className="space-y-4 w-full max-w-4xl pt-8 h-[600px]">
                        <CardContent>
                            <div className="text-xl">
                                {Array.from(totalRankings.keys())[i]}
                            </div>
                            <div>
                                Средний рейтинг:{" "}
                                {(
                                    Math.round(
                                        (Array.from(value.values()).reduce(
                                            (sum, p) => sum + p
                                        ) /
                                            Array.from(value.values()).length) *
                                            100
                                    ) / 100
                                ).toFixed(2)}
                            </div>
                            <div className="flex flex-col flex-wrap h-[500px] pt-2">
                                {Array.from(value.entries()).map((item, i) => (
                                    <div
                                        key={i}
                                        className="inline-block text-center space-y-8"
                                    >
                                        <img
                                            src={`../${item[0]}.jpg`}
                                            className="inline-block self-center w-12 h-12 rounded-full"
                                            alt="CN"
                                        />
                                        <p className="inline-block self-center pl-4 text-xl">
                                            {item[1]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    };

    async function copySongs() {
        await navigator.clipboard.writeText(
            `${chosenAlbumName}\n\n${chosenAlbum.join("\n")}`
        );
    }

    function exportSongs() {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(
            new Blob([`${chosenAlbumName}\n\n${chosenAlbum.join("\n")}`], {
                type: "text/plain",
            })
        );
        if (chosenAlbumName == "" && chosenAlbum.length == 0) {
            throw new Error("Unreachable, for typescript");
        }
        link.download = chosenAlbumName;
        link.click();
    }

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
        nickname: z.string().nonempty("Пожалуйста, выберите никнейм."),
        password: z.string().nonempty("Пожалуйста, введите пароль."),
    });

    const sendForm = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: {
            nickname: "",
            password: "",
        },
    });

    async function update() {
        await upsertRankings(
            sendForm.getValues().nickname,
            searchResult?.result?.albumName,
            searchResult?.result?.songs.map((s) => `${s.name}`),
            songs.map((s) => `${s.name}`)
        );
        toast({
            title: "Ранкинг успешно обновлён!",
        });
    }

    async function reset() {
        setSongs([]);
        setOpenDialog(false);
        setAlbumSelection(true);
        setSongSelection(true);
        setAnotherAlbumSelection(true);
        setSearchResult(null);
        setChosenAlbum([]);
        setAllAlbums([]);
        setTotalRankings(new Map<string, Map<string, number>>());
        setAllUserAlbums([]);
        setAllSongs([]);
        setChosenAlbumName("");
        setChosenSong("");
        setAnotherChosenAlbumName("");
        setChosenNickname("");
    }

    async function send(values: z.infer<typeof sendSchema>) {
        if (await validatePassword(values.nickname, values.password)) {
            if (values.nickname !== "") {
                if (
                    !(await rankingExists(
                        values.nickname,
                        searchResult?.result?.albumName
                    ))
                ) {
                    await upsertRankings(
                        values.nickname,
                        searchResult?.result?.albumName,
                        searchResult?.result?.songs.map((s) => `${s.name}`),
                        songs.map((s) => `${s.name}`)
                    );
                    toast({
                        title: "Ранкинг успешно отправлен на сервер!",
                    });
                } else {
                    setOpenDialog(true);
                }
            }
        } else {
            toast({
                title: "Неверный пароль!",
            });
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
                    onValueChange={async () => {
                        await reset();
                        setAllAlbums(await findAllAlbums());
                        setAnotherAlbumSelection(false);
                    }}
                >
                    <TabsList className="relative w-full">
                        <Toggle
                            variant="outline"
                            aria-label="Toggle theme"
                            onClick={themeSwitch}
                            className="w-1/9"
                        >
                            <SunMoon />
                        </Toggle>
                        <TabsTrigger value="ranking" className="w-1/3">
                            Оценка альбома
                        </TabsTrigger>
                        <TabsTrigger value="rankings" className="w-1/3">
                            Ранкинги
                        </TabsTrigger>
                        <TabsTrigger value="totalRankings" className="w-1/3">
                            Ранкинги (общие)
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ranking">
                        <div className="flex flex-col items-center p-2 space-y-4">
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
                    <TabsContent value="rankings">
                        <div className="flex justify-evenly place-items-center space-x-4 pb-4">
                            <Select
                                value={chosenNickname}
                                onValueChange={async (value) => {
                                    setChosenNickname(value);
                                    setChosenAlbumName("");
                                    setChosenAlbum([]);
                                    if (await checkRankings(value)) {
                                        setAllUserAlbums(
                                            await findAlbums(value)
                                        );
                                        setAlbumSelection(false);
                                    } else {
                                        setAlbumSelection(true);
                                        setAllUserAlbums([]);
                                        toast({
                                            title: "У этого человека нет ранкингов.",
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger className="h-14">
                                    <SelectValue placeholder="Выберите никнейм" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nicknames.map((nickname, i) => (
                                        <SelectItem
                                            key={i}
                                            value={nickname.value}
                                        >
                                            {nickname.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                disabled={albumSelection}
                                value={chosenAlbumName}
                                onValueChange={async (value) => {
                                    setChosenAlbumName(value);
                                    if (value != "") {
                                        setChosenAlbum(
                                            await findRanking(
                                                chosenNickname,
                                                value
                                            )
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger className="h-14">
                                    <SelectValue placeholder="Выберите альбом" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allUserAlbums.map((value, i) => (
                                        <SelectItem key={i} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {albumRankings()}
                    </TabsContent>
                    <TabsContent value="totalRankings">
                        <div className="flex justify-evenly place-items-center space-x-4 pb-4">
                            <Select
                                disabled={anotherAlbumSelection}
                                value={anotherChosenAlbumName}
                                onValueChange={async (value) => {
                                    setSongSelection(true);
                                    setChosenSong("");
                                    setAnotherChosenAlbumName(value);
                                    if (value != "") {
                                        setTotalRankings(
                                            await findTotalRankings(value)
                                        );
                                        setAllSongs(await findSongs(value));
                                        setSongSelection(false);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-14">
                                    <SelectValue placeholder="Выберите альбом" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allAlbums.map((value, i) => (
                                        <SelectItem key={i} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                disabled={songSelection}
                                value={chosenSong}
                                onValueChange={setChosenSong}
                            >
                                <SelectTrigger className="h-14">
                                    <SelectValue placeholder="Выберите трек" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allSongs.map((value, i) => (
                                        <SelectItem key={i} value={value}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {totalAlbumRankings()}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
