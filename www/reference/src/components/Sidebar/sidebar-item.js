import React, { useContext } from "react"
import Collapsible from "react-collapsible"
import { Flex, Box, Text } from "theme-ui"
import { AnchorLink } from "gatsby-plugin-anchor-links"
import styled from "@emotion/styled"
import { convertToKebabCase } from "../../utils/convert-to-kebab-case"
import ChevronDown from "../icons/chevron-down"
import NavigationContext from "../../context/navigation-context"

const StyledCollapsible = styled(Collapsible)`
  margin-bottom: 10px;
`

const Container = styled(Box)`
  div.Collapsible span.Collapsible__trigger.is-open {
    svg {
      transform: rotate(180deg);
    }
  }
`

const StyledNavItem = styled(Flex)`
  padding-left: 16px;
  padding-right: 10px;
  align-items: center;
  border-radius: var(--border-radius-8);
  cursor: pointer;
  margin-right: 4px;
  height: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  &:hover,
  &.active {
    background-color: var(--faded);
  }
`

const StyledAnchorLink = styled(AnchorLink)`
  display: flex;
  margin-left: 10px;
  padding-left: 10px;
  padding-right: 10px;
  align-items: center;
  border-radius: var(--border-radius-8);
  cursor: pointer;
  margin-bottom: 8px;
  text-decoration: none;
  align-items: center;
  color: black;
  height: 25px;
  &:hover {
    ${props =>
      !props.active &&
      `
      background-color: var(--faded);
    `}
  }
  &.active {
    background-color: var(--faded);
  }
`

const SideBarItem = ({ item }) => {
  const {
    openSection,
    openSections,
    currentHash,
    currentSection,
    api,
  } = useContext(NavigationContext)
  const { section } = item
  const subItems = section.paths
    .map(p => {
      return p.methods
    })
    .reduce((pre, cur) => {
      return pre.concat(cur)
    })
    .map(m => {
      return {
        title: m.summary,
        path: convertToKebabCase(m.summary),
      }
    })

  const handleClick = () => {
    const id = convertToKebabCase(section.section_name)
    const element = document.querySelector(`#${id}`)
    if (element) {
      element.scrollIntoView({
        block: "start",
        inline: "nearest",
      })
      if (!openSections.includes(id)) {
        openSection(id)
      }
    }
  }

  return (
    <Container>
      <StyledCollapsible
        trigger={
          <StyledNavItem
            sx={{ fontSize: "1" }}
            className={
              currentSection === convertToKebabCase(section.section_name)
                ? "active"
                : null
            }
          >
            {section.section_name} <ChevronDown />
          </StyledNavItem>
        }
        open={
          currentSection === convertToKebabCase(section.section_name) ||
          openSections.includes(convertToKebabCase(section.section_name))
        }
        onTriggerOpening={handleClick}
        transitionTime={1}
      >
        {subItems.map((si, i) => {
          return (
            <StyledAnchorLink
              key={i}
              to={`#${si.path}`}
              className={currentHash === si.path ? "active" : null}
              onAnchorLinkClick={handleClick}
            >
              <Text
                sx={{
                  fontSize: "0",
                }}
              >
                {si.title}
              </Text>
            </StyledAnchorLink>
          )
        })}
      </StyledCollapsible>
    </Container>
  )
}

export default SideBarItem