import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Fade,
  HStack,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getCocktail } from "~/services/get-cocktail";
import _ from "lodash";

type Cocktail = {
  name: string;
  serveIn: string;
  garnish: string;
  method: string;
  ingredients: Array<{
    quantity: string;
    ingredient: string;
  }>;
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
    { charset: "utf-8" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("cocktailName");
  const data = await getCocktail(query ?? "");

  return json(data);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <Box
      h="full"
      maxW="full"
      p="4"
      sx={{
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <Stack minW="3xl">
        <Form method="GET" style={{ display: "flex", alignItems: "center" }}>
          <Input name="cocktailName" placeholder="Porn Star Martini" />
          <Button type="submit" ml={2}>
            Search
          </Button>
        </Form>
        <Fade in={navigation.state === "idle"}>
          <Card minW="3xl" w="full" shadow="md">
            <>
              <CardHeader display="flex" justifyContent="space-between">
                <Text as="b">{data.name}</Text>{" "}
                <Box>
                  <small>Serve in </small>
                  <Badge borderRadius="full" px="2" colorScheme="blackAlpha">
                    {data.serveIn}
                  </Badge>
                </Box>
              </CardHeader>
              <CardBody>
                <Stack spacing="4">
                  <HStack>
                    <Text as="b">Garnish: </Text>
                    <Text>{data.garnish}</Text>
                  </HStack>

                  <Text
                    dangerouslySetInnerHTML={{ __html: data.method }}
                  ></Text>

                  <Stack>
                    <Text as="b">Ingredients</Text>
                    <Table>
                      <Thead>
                        <Tr>
                          <Th>Quantity</Th>
                          <Th>Ingredient</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {data.ingredients.map((ingredient, index) => (
                          <Tr key={index}>
                            <Td>{ingredient.quantity}</Td>
                            <Td>{ingredient.ingredient}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Stack>
                </Stack>
              </CardBody>
            </>
          </Card>
        </Fade>
      </Stack>
    </Box>
  );
}
