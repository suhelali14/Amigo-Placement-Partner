import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.200";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg" className="text-white font-bold">
        Language:
      </Text>
      <Menu isLazy>
        <MenuButton as={Button} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{language}</MenuButton>
        <MenuList bg="#fff">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : ""}
              bg={lang === language ? "#007acc" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.700",
              }}
              onClick={() => onSelect(lang)}
            >
              {lang}
              &nbsp;
              <Text as="span" color="#EEEEEE" fontSize="sm">
                ({version})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};
export default LanguageSelector;
